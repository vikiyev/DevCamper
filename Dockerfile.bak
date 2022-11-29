FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
# copies both package.json and package-lock.json to docker environment
COPY package*.json ./
RUN npm install

# source files into the image
COPY . .

EXPOSE 5000
CMD ["npm", "start"]