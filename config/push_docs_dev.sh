#!/bin/bash

if [[ $TRAVIS_BRANCH == 'dev' ]]
then
    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"

    git clone https://github.com/Everpoint/everpoint.github.io.git

    cd everpoint.github.io
    rm -vrf ./docs/dev/sgis
    mkdir -vp ./docs/dev/sgis
    cp -vr ../../doc/* ./docs/dev/sgis

    git add -A
    git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"

    git remote add origin-pages https://${GH_TOKEN}@github.com/Everpoint/everpoint.github.io.git > /dev/null 2>&1
    git push --quiet --set-upstream origin-pages master

    cd ../
    rm -rf ./everpoint.github.io
fi