#!/bin/bash
git checkout main && \
(git branch -D dist || true) && \
git checkout -b dist && \
rm .gitignore && \
npm run build && \
cp dist/treebase/index.html dist/treebase/404.html && \
cp CNAME dist/treebase/ || true && \
git add dist/treebase && \
git commit -m dist && \
(git branch -D gh-pages || true) && \
git subtree split --prefix dist/treebase -b gh-pages && \
git push -f origin gh-pages:gh-pages && \
git checkout main && \
git branch -D gh-pages && \
git branch -D dist && \
git checkout . 