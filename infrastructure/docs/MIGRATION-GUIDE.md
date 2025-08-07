# Migration Guide: Auto-Migration Feature

This guide helps existing developers understand the new automatic migration feature added to the Docker setup.

## What Changed

### Before (Manual)
```bash
docker-compose up -d
# → Container starts
# → Manual migration required:
docker-compose exec web php infrastructure/scripts/run-migrations.php
```

### Now (Automatic)
```bash
docker-compose up -d
# → Container starts
# → Automatically runs pending migrations
# → Ready to develop immediately
```

## Benefits

✅ **No more forgotten migrations**: Team members always have the latest schema
✅ **Faster onboarding**: New developers get working setup immediately
✅ **Consistent environments**: Everyone runs the same migrations automatically
✅ **Less friction**: No manual steps required for most development

## Migration Control

The new behavior is controlled by the `AUTO_MIGRATE` environment variable:

### Enable Auto-Migration (Default)
```bash
# In .env file
AUTO_MIGRATE=true

# Or temporarily
AUTO_MIGRATE=true docker-compose up -d
```

### Disable Auto-Migration
```bash
# In .env file
AUTO_MIGRATE=false

# Or temporarily
AUTO_MIGRATE=false docker-compose up -d

# Then run manually when ready
docker-compose exec web php infrastructure/scripts/run-migrations.php
```

## Production Considerations

For production deployments, consider disabling auto-migration:

```bash
# production .env
AUTO_MIGRATE=false
```

This gives you control over when migrations run in production environments.

## Troubleshooting

### If Migration Fails
```bash
# Check what went wrong
docker-compose logs web

# Run migration manually with more details
docker-compose exec web php infrastructure/scripts/run-migrations.php --verbose

# Skip auto-migration and debug
AUTO_MIGRATE=false docker-compose up -d
```

### Rollback Strategy
```bash
# Disable auto-migration
echo "AUTO_MIGRATE=false" >> .env

# Restart container
docker-compose restart web

# Handle migrations manually
docker-compose exec web php infrastructure/scripts/run-migrations.php --rollback
```

## Migration Best Practices

1. **Test migrations locally** before committing
2. **Use descriptive migration names** for easier troubleshooting
3. **Keep migrations small and focused** to minimize failure risk
4. **Always have a rollback plan** for production deployments

## FAQ

**Q: What if I want the old behavior back?**
A: Set `AUTO_MIGRATE=false` in your `.env` file.

**Q: Does this affect production deployments?**
A: Only if you choose to enable it. The default can be configured per environment.

**Q: What happens if a migration fails?**
A: The container will still start, but the migration error will be logged. Check `docker-compose logs web` for details.

**Q: Can I see which migrations ran?**
A: Yes, check the container logs: `docker-compose logs web | grep -i migration`
