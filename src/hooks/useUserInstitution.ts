import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserInstitution() {
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitution = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("institution_id")
        .eq("user_id", user.id)
        .maybeSingle();

      setInstitutionId(profile?.institution_id ?? null);
      setLoading(false);
    };

    fetchInstitution();
  }, []);

  return { institutionId, loading };
}
