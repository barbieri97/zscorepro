#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/release.sh [patch|minor|major]
# Default: minor

BUMP="${1:-minor}"

if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  echo "Uso: $0 [patch|minor|major]"
  exit 1
fi

# Garante que estamos na develop
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "develop" ]]; then
  echo "Erro: execute a partir da branch 'develop' (atual: $BRANCH)"
  exit 1
fi

# Garante working tree limpa
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Erro: há alterações não commitadas. Faça commit antes de continuar."
  exit 1
fi

echo "→ Bumping version ($BUMP)..."
npm version "$BUMP"
VERSION=$(node -p "require('./package.json').version")
TAG="v$VERSION"

echo "→ Pushing develop → origin..."
git push -u origin develop

echo "→ Merging develop into main..."
git checkout main
git merge develop --no-ff -m "Merge develop into main - $TAG"

echo "→ Pushing main + tag $TAG..."
git push origin main
git push origin "$TAG"

echo "→ Criando GitHub Release $TAG..."
PREV_TAG=$(git tag --sort=-version:refname | grep -v "^$TAG$" | head -1)
if [[ -n "$PREV_TAG" ]]; then
  CHANGES=$(git log "$PREV_TAG"..HEAD --pretty=format:"- %s" --no-merges | grep -v "^- $VERSION$" || true)
else
  CHANGES="- Release inicial"
fi

gh release create "$TAG" \
  --title "$TAG" \
  --notes "$(printf "## Alterações\n\n%s\n\n## Versão anterior\n- %s" "$CHANGES" "$PREV_TAG")"

echo ""
echo "✓ Deploy concluído! Release: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases/tag/$TAG"

git checkout develop
