# app/users/email.py
from djoser.email import PasswordResetEmail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags


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


# class CustomPasswordResetEmail(PasswordResetEmail):
#     template_name = 'users/email/password_reset.html'
#     plain_text_template_name = 'users/email/password_reset.txt'
#
#     def get_context(self):
#         context = super().get_context()
#         # Ensure the proper context variables are passed
        # Use 'https' when using SSL in production
#         context['protocol'] = 'http'
#         context['domain'] = 'localhost:5173'
#         context['url'] = self.reset_url(context['uid'], context['token'])
#         return context
#
#     def get_subject(self):
#         """Sets the email subject."""
#         return "Reset Your Password"
#
#     def get_body(self):
#         """Generates the email body."""
#         context = self.get_context_data()
#         # Render HTML and plain-text email templates
#         html_content = render_to_string(self.template_name, context)
#         plain_text_content = render_to_string(
#         self.plain_text_template_name,
#         context
#         )
#         return {'html': html_content, 'text': plain_text_content}
#
#     def send(self, to=None):
#         """Sends the email with both plain-text and HTML content."""
#         # Get the subject, HTML, and plain-text body
#         subject = self.get_subject()
#         body = self.get_body()
#
#         # Debugging: Print the email content to the console
#         print(f"Subject: {subject}")
#         print(f"HTML Content:\n{body['html']}")
#         print(f"Text Content:\n{body['text']}")
#
#         # Construct and send the email
#         super().send(
#             to=to,
#             subject=subject,
#             message=body['text'],  # Plain-text part
#             html_message=body['html'],  # HTML part
#         )
