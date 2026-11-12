FROM repo-prod.gbp.cpm.net:6000/node:18 AS builder

ARG VITE_API_URL=https://Enrolment-uat-api.gbp.cpm.net
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY CPMEnterpriseCertCAW2016.crt /usr/local/share/ca-certificates/CPMEnterpriseCertCAW2016.crt
COPY WHVCAROOTCPM-CA.crt /usr/local/share/ca-certificates/WHVCAROOTCPM-CA.crt

RUN update-ca-certificates

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

COPY package*.json ./

RUN npm config set registry "https://repo-prod.gbp.cpm.net/repository/npm-proxy/"

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm view typescript version

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --no-audit --no-fund

COPY . .

RUN npm run build

FROM repo-prod.gbp.cpm.net:6000/nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]