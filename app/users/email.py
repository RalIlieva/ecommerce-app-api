# app/users/email.py
from djoser.email import PasswordResetEmail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
# from django.utils.html import strip_tags


class CustomPasswordResetEmail(PasswordResetEmail):
    template_name = 'users/email/password_reset.html'
    subject_template_name = 'users/email/password_reset_subject.txt'
    text_template_name = 'users/email/password_reset.txt'

    def send(self, to, *args, **kwargs):
        context = self.get_context_data()
        subject = render_to_string(
            self.subject_template_name, context
        ).strip()
        html_content = render_to_string(self.template_name, context)
        # text_content = strip_tags(html_content)
        text_content = render_to_string(self.text_template_name, context)

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=self.from_email,
            to=to,
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
