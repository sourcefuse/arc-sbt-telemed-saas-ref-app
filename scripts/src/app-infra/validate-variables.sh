if [[ -z "$SYSTEM_ADMIN_EMAIL" ]]; then
    echo "System admin email is required."
    exit 1
fi
if [[ -z "$CODE_COMMIT_REPOSITORY_NAME" ]]; then
    echo "Code commit repository name is required.."
    exit 1
fi

# TODO: validate app sepcific params
