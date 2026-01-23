-- Update the INTERNAL_WEBHOOK_SECRET in the vault to match the new project secret
-- First delete the old secret, then create with the new value

DELETE FROM vault.secrets WHERE name = 'INTERNAL_WEBHOOK_SECRET';

SELECT vault.create_secret(
  '42f9ceff6814951a77fd7c3705256833ed738e276fbe9000200950238ccec649',
  'INTERNAL_WEBHOOK_SECRET', 
  'Shared secret for internal webhook authentication'
);