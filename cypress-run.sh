# Perform the command `cypress run`
# record the run if `CYPRESS_RECORD_KEY` is set
# this way we'll only CI will record runs
# and no non-robots require the record key.

if [ -z "$CYPRESS_RECORD_KEY" ]
then
    ./node_modules/.bin/cypress run --browser chrome
else
    # use chrome on CI so that WebGL works
    ./node_modules/.bin/cypress run --record --browser chrome
fi