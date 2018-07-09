set -o monitor

if [ "$TEST_SUITE" == "unit" ]
  then
      echo "###############################"
      echo "# Runing Available Unit Tests #"
      echo "###############################"

      npm run test-coverage

elif [ "$TEST_SUITE" == "integration" ]
  then

      echo "######################################"
      echo "# Runing Available Integration Tests #"
      echo "######################################"

      npm run test-integration

elif [ "$TEST_SUITE" == "regression" ]
  then
      echo "#####################################"
      echo "# Runing Available Regression Tests #"
      echo "#####################################"

      npm run test-regression

else
    echo "TEST_SUITE env should be set to unit, integration or regression"
fi
