# This is our base community provided image,
# with some minimal distribution of linux
# that comes with NodeJs v10 (and npm) already installed
FROM node:lts

# Use this directory _inside_ your Docker container
# as the base directory of all the next actions
WORKDIR /usr/src/app

# Copy your app's code from the host (your computer) to the container.
# This assumes a typical setup in which the Dockerfile
# is in the root of your project
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install
COPY webpack ./webpack 
COPY .stylelintrc .
COPY .prettierrc .
COPY tsconfig.json .
COPY tslint.json . 
COPY config ./config