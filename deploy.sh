#!/bin/bash
git checkout main && \
(git branch -D dist || true) && \
git checkout -b dist && \
rm .gitignore && \
npm run prod && \
cp dist/treebase/browser/index.html dist/treebase/browser/404.html && \
cp CNAME dist/treebase/browser/ || true && \
git add dist/treebase/browser && \
git commit -m dist && \
(git branch -D gh-pages || true) && \
git subtree split --prefix dist/treebase/browser -b gh-pages && \
git push -f origin gh-pages:gh-pages && \
git checkout main && \
git branch -D gh-pages && \
git branch -D dist && \
git checkout . 