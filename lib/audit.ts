import { prisma } from "./db";

export async function logAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  metadata?: object
): Promise<void> {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, metadata: metadata ?? undefined },
  }).catch((err) => {
    console.error("audit log write failed", { actorId, action, entity, entityId, err });
  });
}
