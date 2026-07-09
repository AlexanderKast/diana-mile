"use client";

import { useState } from "react";
import { cx } from "@diana-mile/shared/utils";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input } from "@diana-mile/shared/ui/Input";
import type { RolUsuario, UsuarioAdmin } from "@diana-mile/shared/types";
import { useSession } from "@/lib/session";

type UsuariosTableProps = {
  usuarios: UsuarioAdmin[];
};

const ROLES: { value: RolUsuario; label: string }[] = [
  { value: "superadmin", label: "Superadmin" },
  { value: "admin", label: "Admin" },
  { value: "confirmador", label: "Confirmador" },
  { value: "logistica", label: "Logistica" },
  { value: "financiero", label: "Financiero" },
  { value: "readonly", label: "Solo lectura" },
];

const ROL_LABELS: Record<RolUsuario, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  confirmador: "Confirmador",
  logistica: "Logistica",
  financiero: "Financiero",
  readonly: "Solo lectura",
};

function rolBadgeClass(rol: RolUsuario): string {
  switch (rol) {
    case "superadmin":
      return "bg-dorado/20 text-dorado-oscuro";
    case "admin":
      return "bg-morado/15 text-morado-oscuro";
    case "confirmador":
      return "bg-lila-suave text-morado-oscuro";
    case "logistica":
      return "bg-arena text-carbon";
    case "financiero":
      return "bg-carbon/10 text-carbon";
    case "readonly":
      return "bg-ceniza/20 text-carbon-suave";
    default:
      return "bg-arena text-carbon";
  }
}

function formatFecha(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UsuariosTable({ usuarios }: UsuariosTableProps) {
  const session = useSession();
  const [usuariosLocal, setUsuariosLocal] = useState<UsuarioAdmin[]>(usuarios);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const [panelAbierto, setPanelAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoRol, setNuevoRol] = useState<RolUsuario>("confirmador");
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const actualizarUsuarioLocal = (usuarioActualizado: UsuarioAdmin) => {
    setUsuariosLocal((prev) =>
      prev.map((u) => (u.id === usuarioActualizado.id ? usuarioActualizado : u))
    );
  };

  const handlePatch = async (id: string, body: { rol?: RolUsuario; activo?: boolean }) => {
    setActualizandoId(id);
    setErrorAccion(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      actualizarUsuarioLocal(json.usuario);
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo actualizar el usuario.");
    } finally {
      setActualizandoId(null);
    }
  };

  const handleAgregarUsuario = async () => {
    setErrorFormulario(null);
    setMensajeExito(null);

    if (!nuevoEmail.trim() || !nuevoNombre.trim()) {
      setErrorFormulario("El correo y el nombre son obligatorios.");
      return;
    }

    setCreando(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nuevoEmail.trim(),
          nombre: nuevoNombre.trim(),
          rol: nuevoRol,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");

      setUsuariosLocal((prev) => [json.usuario, ...prev]);
      setMensajeExito(
        json.invitacionEnviada
          ? `Invitacion enviada a ${json.usuario.email}`
          : `Usuario agregado con la cuenta existente de ${json.usuario.email}`
      );
      setNuevoEmail("");
      setNuevoNombre("");
      setNuevoRol("confirmador");
      setPanelAbierto(false);
    } catch (e) {
      setErrorFormulario(e instanceof Error ? e.message : "No se pudo crear el usuario.");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-ceniza">
          {usuariosLocal.length} usuario{usuariosLocal.length === 1 ? "" : "s"}
        </span>
        <Button
          variant="secondary"
          className="!min-h-0 !py-2 !px-4 text-sm"
          onClick={() => {
            setPanelAbierto((v) => !v);
            setErrorFormulario(null);
            setMensajeExito(null);
          }}
        >
          {panelAbierto ? "Cancelar" : "+ Agregar usuario"}
        </Button>
      </div>

      {mensajeExito && (
        <div className="mb-4 rounded-[2px] border border-dorado/40 bg-dorado/10 px-4 py-2 text-sm text-dorado-oscuro">
          {mensajeExito}
        </div>
      )}
      {errorAccion && (
        <div className="mb-4 rounded-[2px] border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
          {errorAccion}
        </div>
      )}

      {panelAbierto && (
        <div className="mb-4 bg-blanco border border-arena rounded-[4px] p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
            <Input
              label="Correo"
              type="email"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
            <Input
              label="Nombre"
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre completo"
            />
            <label className="text-sm">
              <span className="block text-xs text-ceniza font-medium mb-1.5">Rol</span>
              <select
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value as RolUsuario)}
                className="min-h-[44px] w-full rounded-[2px] border border-arena bg-blanco px-3 py-2 text-sm text-carbon focus:outline-none focus:border-dorado"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <Button disabled={creando} onClick={handleAgregarUsuario}>
              {creando ? "Enviando..." : "Enviar invitacion"}
            </Button>
          </div>
          {errorFormulario && <p className="text-xs text-error mt-3">{errorFormulario}</p>}
        </div>
      )}

      <div className="overflow-x-auto bg-blanco border border-arena rounded-[4px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-ceniza text-xs uppercase">
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Rol</th>
              <th className="text-left py-3 px-4">Activo</th>
              <th className="text-left py-3 px-4">Ultimo acceso</th>
              <th className="text-left py-3 px-4">Creado</th>
            </tr>
          </thead>
          <tbody>
            {usuariosLocal.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ceniza">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuariosLocal.map((usuario) => {
                const actualizando = actualizandoId === usuario.id;
                const esUnoMismo = usuario.email.toLowerCase() === session.email.toLowerCase();
                return (
                  <tr key={usuario.id} className="border-b border-arena/50 hover:bg-crema transition-colors">
                    <td className="py-3 px-4 text-carbon">
                      {usuario.nombre}
                      {esUnoMismo && <span className="text-xs text-ceniza ml-1">(tu)</span>}
                    </td>
                    <td className="py-3 px-4 text-carbon-suave">{usuario.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={usuario.rol}
                        disabled={actualizando || esUnoMismo}
                        title={esUnoMismo ? "No podes cambiar tu propio rol" : undefined}
                        onChange={(e) =>
                          handlePatch(usuario.id, { rol: e.target.value as RolUsuario })
                        }
                        className={cx(
                          "min-h-[36px] rounded-[2px] border border-arena bg-blanco px-2 py-1 text-xs font-medium focus:outline-none focus:border-dorado disabled:opacity-50",
                          rolBadgeClass(usuario.rol)
                        )}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        disabled={actualizando || esUnoMismo}
                        title={esUnoMismo ? "No podes desactivar tu propia cuenta" : undefined}
                        onClick={() => handlePatch(usuario.id, { activo: !usuario.activo })}
                        aria-pressed={usuario.activo}
                        className={cx(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
                          usuario.activo ? "bg-dorado" : "bg-arena"
                        )}
                      >
                        <span
                          className={cx(
                            "inline-block h-4 w-4 transform rounded-full bg-blanco transition-transform",
                            usuario.activo ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-carbon-suave whitespace-nowrap">
                      {formatFecha(usuario.ultimo_acceso)}
                    </td>
                    <td className="py-3 px-4 text-carbon-suave whitespace-nowrap">
                      {formatFecha(usuario.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
