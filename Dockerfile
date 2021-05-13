FROM node
EXPOSE 3000
ADD / sabemiBot
WORKDIR sabemiBot
RUN npm install
ENTRYPOINT ["node", "bot.js"]
