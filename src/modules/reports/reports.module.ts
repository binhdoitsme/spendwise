import { getDbConnectionPool } from "@/db";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { provideAccountRepository } from "../accounts/account.module";
import { provideJournalRepository } from "../journals/journal.module";
import { ReportServices } from "./application/services/account-report.service";
import { DrizzleAccountReportRepository } from "./infrastructure/db/repositories/account-report.repository";
import { DrizzleJournalReportRepository } from "./infrastructure/db/repositories/journal-report.repository";
import * as schema from "./infrastructure/db/schemas";
import { DrizzleReportAccountResolver } from "./infrastructure/external/account-resolver";
import { DrizzleReportJournalResolver } from "./infrastructure/external/journal-resolver";

export function provideReportServices(
  connectionPool: Pool = getDbConnectionPool()
) {
  const dbInstance = drizzle(connectionPool, { schema });
  const accountReportRepository = new DrizzleAccountReportRepository(
    dbInstance
  );
  const journalReportRepository = new DrizzleJournalReportRepository(
    dbInstance
  );
  const journalRepository = provideJournalRepository(connectionPool);
  const journalResolver = new DrizzleReportJournalResolver(journalRepository);
  const accountRepository = provideAccountRepository(connectionPool);
  const accountResolver = new DrizzleReportAccountResolver(accountRepository);
  return new ReportServices(
    accountReportRepository,
    journalReportRepository,
    accountResolver,
    journalResolver
  );
}
