Push all changes to GitHub and auto-deploy to GitHub Pages.

```bash
cd "/Users/ashish/Library/CloudStorage/GoogleDrive-ashishgupta151084@gmail.com/My Drive/Claude/Claude_Code/payroll-pro" && git add . && git diff --cached --quiet && echo "Nothing to commit." || git commit -m "Update: $(date '+%d %b %Y %H:%M')" && git push origin main && echo "✅ Pushed! GitHub Pages will redeploy in ~1 minute."
```
