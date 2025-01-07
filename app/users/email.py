# app/users/email.py
from djoser.email import PasswordResetEmail


class CustomPasswordResetEmail(PasswordResetEmail):
    template_name = 'users/email/password_reset.html'

    def get_context(self):
        context = super().get_context()
        # Ensure the proper context variables are passed
        context['protocol'] = 'http'  # Use 'https' if you're using SSL in production
        context['domain'] = 'localhost:5173'  # Update as needed
        context['url'] = self.reset_url(context['uid'], context['token'])
        return context
