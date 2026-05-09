from __future__ import annotations

from uuid import uuid4

from sqlalchemy import and_, desc, func, select
from sqlalchemy.orm import Session

from app.models.dropoff import Dropoff
from app.models.site import Site


class DropoffRepository:
    def __init__(self, db: Session):
        self.db = db

    def lock_company_row(self, company_id: str) -> None:
        from app.models.company import Company

        stmt = select(Company).where(Company.id == company_id).with_for_update()
        company = self.db.scalars(stmt).first()
        if company is None:
            raise ValueError("Company not found")

    def get_last_record_hash(self, company_id: str) -> str | None:
        stmt = (
            select(Dropoff.record_hash)
            .where(Dropoff.company_id == company_id)
            .order_by(desc(Dropoff.confirmed_at), desc(Dropoff.id))
            .limit(1)
        )
        return self.db.scalars(stmt).first()

    def create(self, dropoff: Dropoff) -> Dropoff:
        self.db.add(dropoff)
        self.db.flush()
        return dropoff

    def _base_recycler_query(self, recycler_id: str):
        return select(Dropoff).where(Dropoff.recycler_id == recycler_id)

    def get_by_client_reference(self, company_id: str, client_reference_id: str) -> Dropoff | None:
        stmt = select(Dropoff).where(
            and_(
                Dropoff.company_id == company_id,
                Dropoff.client_reference_id == client_reference_id,
            )
        )
        return self.db.scalars(stmt).first()

    def get_by_recycler(self, recycler_id: str, *, limit: int = 20, offset: int = 0) -> list[Dropoff]:
        stmt = (
            self._base_recycler_query(recycler_id)
            .order_by(desc(Dropoff.confirmed_at), desc(Dropoff.id))
            .limit(limit)
            .offset(offset)
        )
        return list(self.db.scalars(stmt).all())

    def count_by_recycler(self, recycler_id: str) -> int:
        stmt = select(func.count()).select_from(Dropoff).where(Dropoff.recycler_id == recycler_id)
        return int(self.db.scalar(stmt) or 0)

    def get_by_company_with_labels(
        self, company_id: str, *, limit: int = 50, offset: int = 0
    ) -> list[tuple[Dropoff, str, str]]:
        from app.models.user import User

        stmt = (
            select(Dropoff, Site.name, User.full_name)
            .join(Site, Site.id == Dropoff.site_id)
            .join(User, User.id == Dropoff.recycler_id)
            .where(Dropoff.company_id == company_id)
            .order_by(desc(Dropoff.confirmed_at), desc(Dropoff.id))
            .limit(limit)
            .offset(offset)
        )
        rows = self.db.execute(stmt).all()
        return [(row[0], str(row[1]), str(row[2])) for row in rows]

    @staticmethod
    def new_id() -> str:
        return str(uuid4())
