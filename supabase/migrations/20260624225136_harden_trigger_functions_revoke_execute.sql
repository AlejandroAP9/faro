-- Las funciones de trigger no deben ser invocables como RPC. Revocar EXECUTE.
-- Los triggers siguen disparando (no dependen de EXECUTE del rol que hace el insert).

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.bump_deviation_counter() from public, anon, authenticated;
