set -o monitor

if [ "$TEST_SUITE" == "unit" ]
  then
      echo "###############################"
      echo "# Running Available Unit Tests #"
      echo "###############################"

      yarn test-coverage

elif [ "$TEST_SUITE" == "integration" ]
  then

      echo "######################################"
      echo "# Running Available Integration Tests #"
      echo "######################################"

      yarn test-integration

elif [ "$TEST_SUITE" == "regression" ]
  then
      echo "#####################################"
      echo "# Running Available Regression Tests #"
      echo "#####################################"

      yarn test-ci:cypress

elif [ "$TEST_SUITE" == "build" ]
  then
    echo "#####################################"
    echo "# Linting and Building package #"
    echo "#####################################"

    yarn lint
    yarn build

else
    echo "exit 1. TEST_SUITE env should be set to unit, integration or regression"
    exit 1
fi
