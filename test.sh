#Run unit tests
node ./node_modules/mocha/bin/mocha --compilers js:babel-core/register

#Detect the OS
#credit for this - http://stackoverflow.com/questions/394230/detect-the-os-from-a-bash-script
platform='unknown'
unamestr=`uname`
if [[ "$unamestr" == 'Linux' ]]; then
   platform='linux'
elif [[ "$unamestr" == 'FreeBSD' ]]; then
   platform='freebsd'
fi

#Run integration tests
if [[ $platform == 'linux' ]]; then
    xdg-open http://localhost:8080/test/integrationtests.html
elif [[ $platform == 'freebsd' ]]; then
    open http://localhost:8080/test/integrationtests.html
fi

