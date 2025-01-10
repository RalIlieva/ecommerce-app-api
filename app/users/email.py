# app/users/email.py
from djoser.email import PasswordResetEmail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags


class CustomPasswordResetEmail(PasswordResetEmail):
    template_name = 'users/email/password_reset.html'
    # subject_template_name = 'users/email/password_reset_subject.txt'

    def send(self, to, *args, **kwargs):
        context = self.get_context_data()
        # subject = render_to_string(self.subject_template_name, context).strip()
        html_content = render_to_string(self.template_name, context)
        text_content = strip_tags(html_content)

        email = EmailMultiAlternatives(
            # subject=subject,
            body=text_content,
            from_email=self.from_email,
            to=to,  # Corrected: Pass 'to' directly
        )
        email.attach_alternative(html_content, "text/html")
        email.send()


# class CustomPasswordResetEmail(PasswordResetEmail):
#     template_name = 'users/email/password_reset.html'  # HTML template
#     plain_text_template_name = 'users/email/password_reset.txt'  # Plain-text template
#
#     def get_context(self):
#         context = super().get_context()
#         # Ensure the proper context variables are passed
#         context['protocol'] = 'http'  # Use 'https' when using SSL in production
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
#         plain_text_content = render_to_string(self.plain_text_template_name, context)
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


# # app/users/email.py
# from djoser.email import PasswordResetEmail
# from django.template.loader import render_to_string
#
#
# class CustomPasswordResetEmail(PasswordResetEmail):
#     template_name = 'users/email/password_reset.html'
#
#     def get_context(self):
#         context = super().get_context()
#         # Ensure the proper context variables are passed
#         context['protocol'] = 'http'  # Use 'https' when using SSL in production
#         context['domain'] = 'localhost:5173'
#         context['url'] = self.reset_url(context['uid'], context['token'])
#         return context
#
#     # def send(self, to=None):
#     #     # Log the context data to check the body content
#     #     context = self.get_context_data()
#     #     html_content = context.get('html_content')
#     #     text_content = context.get('text_content')
#     #
#     #     # Print the content to the console (for debugging)
#     #     print(f"HTML Content: {html_content}")
#     #     print(f"Text Content: {text_content}")
#     #
#     #     # Continue sending the email
#     #     super().send(to)
#
#     # def send(self, to=None):
#     #     # Manually render the template with the context
#     #     context = self.get_context_data()
#     #
#     #     html_content = render_to_string(self.template_name, context)
#     #     text_content = render_to_string('users/email/password_reset.txt', context)
#     #
#     #     # Log the rendered content to check
#     #     print(f"HTML Content: {html_content}")
#     #     print(f"Text Content: {text_content}")
#     #
#     #     # Continue sending the email
#     #     super().send(to)
#
#     def get_subject(self):
#         return "Reset Your Password"  # Ensure a subject is set
#
#     def get_body(self):
#         if self.context.get("user"):
#             # Generate the body based on user and context
#             return super().get_body()
#         return "There was an error generating the email body."
