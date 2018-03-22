
if [ -z $1 ]
then
  echo "Build Test"
  ng build --aot --prod --delete-output-path=false
  gulp deploy-test
fi

if [ "$1" == "production" ]
then
  echo "Build Production"
  ng build --prod --env=prod --aot --delete-output-path=false  
fi