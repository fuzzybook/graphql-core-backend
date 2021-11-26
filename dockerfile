FROM node:14

ENV POSTGRES=127.0.0.1
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
RUN mkdir ./build
COPY ./build ./build



EXPOSE 4000
CMD [ "node", "build/index.js" ]