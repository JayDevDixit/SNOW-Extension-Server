# Base image
FROM node:24-alpine

RUN mkdir -p /home/app/snowserver/
RUN mkdir -p /home/app/data/
RUN mkdir -p /home/app/logs/

WORKDIR /home/app/snowserver/

COPY package*.json .
RUN npm install --production

COPY . .

# Creating user that run app
RUN addgroup app && adduser -S -G app app


RUN chown -R app:app /home/app/
USER app

EXPOSE 5000

CMD ["npm","start"]

