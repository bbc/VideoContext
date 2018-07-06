set -o monitor

echo "###############################"
echo "# Runing Available Unit Tests #"
echo "###############################"

npm run test-coverage

echo "#####################################"
echo "# Runing Available Regression Tests #"
echo "#####################################"

npm run test-regression

echo "######################################"
echo "# Runing Available Integration Tests #"
echo "######################################"

npm run test-integration
