if ! aws codecommit get-repository --repository-name $CODE_COMMIT_REPOSITORY_NAME --query "repositories[0]" --output text 2>/dev/null; then
  CREATE_REPO=$(aws codecommit create-repository --repository-name $CODE_COMMIT_REPOSITORY_NAME --repository-description "$CODE_COMMIT_REPOSITORY_DESCRIPTION")
  echo "Created Repository: $CREATE_REPO"
fi

REPO_URL="codecommit::${REGION}://$CODE_COMMIT_REPOSITORY_NAME"
if ! git remote add cc "$REPO_URL"; then
  echo "Setting url to remote cc..."
  git remote set-url cc "$REPO_URL"
fi

git push cc "$(git branch --show-current)":main -f --no-verify
SBT_PARAM_COMMIT_ID=$(git log --format="%H" -n 1)
echo "Repo Push Successful: Commit Id: $SBT_PARAM_COMMIT_ID"
