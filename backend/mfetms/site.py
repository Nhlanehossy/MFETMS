from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.views.static import serve


FRONTEND_DIR = settings.BASE_DIR.parent / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"


def healthz(request):
    return JsonResponse({"status": "ok"})


def website(request, path=""):
    index_path = FRONTEND_DIST / "index.html"
    if not index_path.exists():
        if not path:
            return JsonResponse({
                "status": "ok",
                "service": "MFETMS API",
                "frontend": "Deploy the React frontend on Vercel.",
            })
        if path == "favicon.ico":
            return HttpResponse(status=204)
        raise Http404("Frontend build was not found.")
    return FileResponse(index_path.open("rb"), content_type="text/html")


def frontend_asset(request, path):
    asset_root = FRONTEND_DIST / "assets" if (FRONTEND_DIST / "assets").exists() else FRONTEND_DIR / "assets"
    requested = (asset_root / path).resolve()
    if asset_root.resolve() not in requested.parents and requested != asset_root.resolve():
        raise Http404("Invalid asset path.")
    return serve(request, path, document_root=asset_root)
