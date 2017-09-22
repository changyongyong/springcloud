echo off

echo [INFO] please input version:

set /p newVersion=

echo [INFO] you input %newVersion% start modify version

cd shengyibao-tools

call mvn clean versions:set -DnewVersion=%newVersion%

call mvn clean deploy -DskipTests=true

cd ..

call mvn -N versions:update-child-modules

call mvn versions:commit

echo [INFO] please check every module version new version is %newVersion%

pause

call mvn clean deploy -DskipTests=true

call mvn clean -DskipTests=true

echo [INFO]deployed

pause

