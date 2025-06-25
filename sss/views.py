# Third-Party
from django import http
from django import shortcuts
from django.views.generic import base
from django.contrib import auth
from django import conf
from django.shortcuts import redirect
from django.contrib import messages

class HomePage(base.TemplateView):
    """Home page view."""

    # Template name
    template_name = "sss/home.html"
    error_template = "sss/error_message.html"

    def get(self, request, *args, **kwargs):
        """Provides the GET request endpoint for the HomePage view.

        Args:
            request (http.HttpRequest): The incoming HTTP request.
            *args (Any): Extra positional arguments.
            **kwargs (Any): Extra keyword arguments.

        Returns:
            http.HttpResponse: The rendered template response.
        """
        # Construct Context
        context: dict[str, Any] = {}
        
        if request.user.is_authenticated:
            return shortcuts.render(request, self.template_name, context)
        else:
            return shortcuts.render(request, self.error_template, context)
        # Render Template and Return

def sss_redirect(request):
    return redirect('home')


        