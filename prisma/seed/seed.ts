import { PrismaClient, RoleScope } from "@prisma/client";

const prisma = new PrismaClient();

const permissionKeys = [
  "platform.businesses.read",
  "platform.businesses.manage",
  "platform.users.read",
  "platform.users.manage",
  "platform.settings.manage",
  "platform.audit.read",
  "business.users.read",
  "business.users.manage",
  "business.roles.manage",
  "business.products.manage",
  "business.inventory.read",
  "business.inventory.manage",
  "business.purchases.manage",
  "business.sales.manage",
  "business.suppliers.manage",
  "business.customers.manage",
  "business.warehouses.manage",
  "business.reports.read",
  "business.notifications.read",
  "business.audit.read",
];

async function main() {
  const permissions = await Promise.all(
    permissionKeys.map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key },
      }),
    ),
  );

  const existingRole = await prisma.role.findFirst({
    where: { name: "System Admin", scope: RoleScope.PLATFORM, businessId: null },
  });
  const platformRole =
    existingRole ??
    (await prisma.role.create({
      data: { name: "System Admin", scope: RoleScope.PLATFORM, isSystem: true },
    }));

  const platformPermissions = permissions.filter((permission) =>
    permission.key.startsWith("platform."),
  );
  await Promise.all(
    platformPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: platformRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: platformRole.id, permissionId: permission.id },
      }),
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
