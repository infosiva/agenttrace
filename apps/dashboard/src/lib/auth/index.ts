import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { Resend } from 'resend';
import { db, users, accounts, sessions, verificationTokens } from '@/lib/db';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
    verifyRequest: '/login?check=email',
  },
  providers: [
    {
      id: 'email',
      type: 'email',
      name: 'Email',
      from: process.env.EMAIL_FROM ?? 'no-reply@agentlogs.app',
      maxAge: 24 * 60 * 60,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        if (!resend) {
          console.error('RESEND_API_KEY missing — magic link URL:', url);
          return;
        }
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? 'AgentLogs <no-reply@agentlogs.app>',
          to: email,
          subject: 'Sign in to AgentLogs',
          html: `
            <div style="font-family:ui-monospace,monospace;background:#020617;color:#e2e8f0;padding:32px;border-radius:12px;max-width:480px;margin:0 auto">
              <h1 style="color:#22c55e;font-size:20px;margin:0 0 16px">AgentLogs</h1>
              <p>Click below to sign in.</p>
              <a href="${url}" style="display:inline-block;background:#22c55e;color:#020617;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:16px">Sign in →</a>
              <p style="color:#64748b;font-size:12px;margin-top:24px">If you didn't request this, ignore the email.</p>
            </div>
          `,
          text: `Sign in to AgentLogs: ${url}`,
        });
        if (error) throw new Error(`Resend error: ${error.message}`);
      },
      // required by NextAuth typing
      options: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
