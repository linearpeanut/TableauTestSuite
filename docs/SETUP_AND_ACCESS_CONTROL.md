# Setup & Repository Access Control

## Making Your Repository Read-Only

Since you want only yourself to be able to edit this repository, follow these steps:

### Step 1: Set Repository to Private (Recommended)

1. Go to your repository: https://github.com/linearpeanut/TableauTestSuite
2. Click **Settings** (top right)
3. Scroll to **Danger Zone** at the bottom
4. Under **Visibility**, click **Change visibility**
5. Select **Private**
6. Confirm by typing the repository name

**Benefits:**
- Only you and invited collaborators can see the repo
- Prevents unauthorized forks and clones
- Reduces exposure of internal tools

### Step 2: Enable Branch Protection Rules

1. In **Settings**, click **Branches** (left sidebar)
2. Under **Branch protection rules**, click **Add rule**
3. Enter branch name pattern: `main`
4. Enable the following:
   - ✅ **Require a pull request before merging**
     - Require approvals: 1
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Restrict who can push to matching branches**
     - Select yourself only
5. Click **Create**

**Effect:**
- All changes must go through pull requests
- You must approve all PRs before merging
- Direct pushes to `main` are blocked
- Only you can push to `main`

### Step 3: Manage Collaborator Permissions

1. In **Settings**, click **Collaborators and teams** (left sidebar)
2. For any collaborators:
   - Set permission to **Read** (view-only)
   - Do NOT grant **Write** or **Admin** access
3. If no collaborators needed, leave empty

**Result:**
- Collaborators can view and clone the repo
- They cannot push changes or create branches
- Only you have write access

### Step 4: Disable Forking (Optional)

1. In **Settings**, scroll to **Forking**
2. Uncheck **Allow forking**
3. Save

**Effect:**
- Users cannot create public forks
- Reduces unauthorized copies

## Verification Checklist

- [ ] Repository is set to **Private**
- [ ] Branch protection rule exists for `main`
- [ ] Only you can push to `main`
- [ ] All collaborators have **Read** permission only
- [ ] Forking is disabled (optional)

## For End Users: Accessing the Bookmarklet

Since the repo is private, share the bookmarklet via:

### Option 1: Share the Installer HTML
```html
<!-- Host installer.html on your internal server or wiki -->
<a href="https://your-internal-server.com/installer.html">Install Tableau Test Suite</a>
```

### Option 2: Share the Minified Code
```
Copy the content of src/bookmarklet-minified.js and share directly
```

### Option 3: Grant Read-Only Access
```
Invite users as collaborators with "Read" permission
They can clone/pull but cannot push changes
```

## Updating the Repository

Since only you can push to `main`:

1. **Make changes locally:**
   ```bash
   git clone https://github.com/linearpeanut/TableauTestSuite.git
   cd TableauTestSuite
   # Edit files
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "v0.1.1: Add new feature"
   git push origin main
   ```

3. **If branch protection requires PR:**
   - Create a feature branch
   - Push to feature branch
   - Create PR on GitHub
   - Approve and merge your own PR

## Troubleshooting

### "Permission denied" when pushing
- Verify you're using the correct GitHub credentials
- Check that your SSH key is added to GitHub
- Ensure you're pushing to `main` (not a protected branch)

### Collaborators can still push
- Verify they have **Read** permission (not Write/Admin)
- Check branch protection rules are enabled
- Confirm rule applies to `main` branch

### Can't create PR
- Branch protection may require status checks
- Ensure all required checks pass
- Verify you have admin access to approve your own PR

## Security Best Practices

1. **Use SSH keys** instead of HTTPS passwords
2. **Enable 2FA** on your GitHub account
3. **Review collaborators** regularly
4. **Audit branch protection rules** quarterly
5. **Keep bookmarklet code updated** with security patches

---

**Last Updated:** October 31, 2025
**Version:** v0.1-alpha
