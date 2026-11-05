Run the isolated PHP security checks with `php tests/security-regression.php`.
These use WordPress stubs; also smoke-test real form submissions and CSV exports in WordPress before release.

Dynamic metadata defaults now require server-side approval. User metadata permits
`first_name`, `last_name`, `nickname`, and `description` by default. Post metadata
permits no keys by default. Trusted plugin or theme PHP can extend the arrays via
`gutenverse_form_dynamic_user_meta_allowed_keys` and
`gutenverse_form_dynamic_post_meta_allowed_keys`. Only approve keys safe to expose
in rendered page HTML to someone who can publish blocks and view that page.

Forms must resolve to saved form-builder blocks. The former client-derived
fallback schema and its two filters have been removed; legacy forms that depended
on it must be saved with a resolvable form-builder block before accepting submissions.
