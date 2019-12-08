# PPPolice
 osu pp reminder

installation:

1. install mongodb
2. make a database
3. (optional) create user and use auth to ensure security
4. copy config/pppolice.sample.js to config/pppolice.js and edit api and db object to fit your instance.
5. npm install
6. npm start / node index.js / use PM2(recommended) to start pppolice.
7. (optional) your police should run at tcp port 13333, you could set up a proxy server 

api document:
http api:
routes/apis/pppolice/v1/api
