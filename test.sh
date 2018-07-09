set -o monitor

if [ "$TEST_SUITE" == "unit" ]
  then
      echo "###############################"
      echo "# Running Available Unit Tests #"
      echo "###############################"

      npm run test-coverage

elif [ "$TEST_SUITE" == "integration" ]
  then

      echo "######################################"
      echo "# Running Available Integration Tests #"
      echo "######################################"

      npm run test-integration

elif [ "$TEST_SUITE" == "regression" ]
  then
      echo "#####################################"
      echo "# Running Available Regression Tests #"
      echo "#####################################"

      npm run test-regression

elif [ "$TEST_SUITE" == "build" ]
  then
    echo "#####################################"
    echo "# Linting and Building package #"
    echo "#####################################"

    npm run lint
    npm run build

else
    echo "exit 1. TEST_SUITE env should be set to unit, integration or regression"
    exit 1
fi
