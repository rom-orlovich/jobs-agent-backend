
FROM node:18-slim as bulider
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 


FROM node:18-slim 
# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
WORKDIR /app
ENV NODE_ENV="production"

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=bulider /app/dist dist

EXPOSE 5000

CMD ["node","./dist/src/server/index.js"]