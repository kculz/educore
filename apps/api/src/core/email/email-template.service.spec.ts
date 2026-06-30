import { EmailTemplateService } from './email-template.service';

describe('EmailTemplateService', () => {
  it('renders a welcome template', () => {
    const service = new EmailTemplateService();
    const rendered = service.render('welcome', {
      name: 'Jane',
    });

    expect(rendered.subject).toBe('Welcome to EduCore');
    expect(rendered.body).toContain('Jane');
  });
});

