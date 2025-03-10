# se3350_project-group-13

to get started with development of the react native app:

1. Navigate to the healthCare folder directory
2. run 'npm install' to install all dependencies
3. follow this helpful guide to set up expo:
   https://docs.expo.dev/get-started/set-up-your-environment/
   expo is used for testing of the mobile app. You'll have to either download the expo go app on your phone or run a simulator on you computer/laptop
4. run 'npx expo start' to start the server
5. a QR will generate in the CLI: scan it with your phone and it will open up expo go on you phone OR follow the CLI instructions to start the mobile simulator

instructions for connecting to yugabytedb

1. download yugabyte for mac, or download docker desktop and go from there
   https://docs.yugabyte.com/preview/tutorials/quick-start/docker/

2. run yugabyte in cli, helpful commands if running through yugabyte

docker ps (this will retrieve the container id)
docker exec -it <container id> bash
netstat -tulnp | grep 5433 (tells you which ports yugabyte is listening on)
ysqlsh -h 172.17.0.2 -p 5433 -U yugabyte (connect to port, can run sql commands from here)
