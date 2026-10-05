// Supabase Edge Function: Tüm kullanıcılar için periyodik server-side backup
// Bu dosyayı kendi Supabase projenizde `supabase/functions/backup/index.ts` olarak kullanabilirsiniz.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Yardımcı: Güvenli dosya adı üret
const safeTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

Deno.serve(async (req) => {
  try {
    // Tüm kullanıcı profillerini al
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id');

    if (usersError) {
      console.error('Kullanıcı listesi alınamadı:', usersError);
      return new Response(
        JSON.stringify({ success: false, error: 'Kullanıcı listesi alınamadı' }),
        { status: 500 }
      );
    }

    const results: { userId: string; success: boolean }[] = [];

    for (const user of users ?? []) {
      const userId = user.id as string;

      // DB fonksiyonundan JSON backup al
      const { data, error } = await supabase
        .rpc('get_user_full_backup', { p_user_id: userId });

      if (error) {
        console.error('Backup RPC hatası:', userId, error);
        results.push({ userId, success: false });
        continue;
      }

      const fileName = `user/${userId}/${safeTimestamp()}.json`;

      const uploadRes = await supabase.storage
        .from('backups')
        .upload(fileName, JSON.stringify(data), {
          contentType: 'application/json',
          upsert: false,
        });

      if (uploadRes.error) {
        console.error('Backup upload hatası:', userId, uploadRes.error);
        results.push({ userId, success: false });
        continue;
      }

      results.push({ userId, success: true });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        details: results,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error('Genel backup hatası:', e);
    return new Response(
      JSON.stringify({ success: false, error: 'Beklenmeyen bir hata oluştu' }),
      { status: 500 }
    );
  }
});


