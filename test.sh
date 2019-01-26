set -o monitor

if [ "$TEST_SUITE" == "unit" ]
  then
      echo "###############################"
      echo "# Running Available Unit Tests #"
      echo "###############################"

      yarn run test-coverage

elif [ "$TEST_SUITE" == "integration" ]
  then

      echo "######################################"
      echo "# Running Available Integration Tests #"
      echo "######################################"

      yarn run test-integration

elif [ "$TEST_SUITE" == "regression" ]
  then
      echo "#####################################"
      echo "# Running Available Regression Tests #"
      echo "#####################################"

      yarn run test-regression

elif [ "$TEST_SUITE" == "build" ]
  then
    echo "#####################################"
    echo "# Linting and Building package #"
    echo "#####################################"

    yarn run lint
    yarn run build

else
    echo "exit 1. TEST_SUITE env should be set to unit, integration or regression"
    exit 1
fi
