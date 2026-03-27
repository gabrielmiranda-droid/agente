from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.conversation import Contact, Conversation, Message


class ConversationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_or_create_contact(self, *, company_id: int, phone_number: str, name: str | None) -> Contact:
        contact = self.db.scalar(
            select(Contact).where(Contact.company_id == company_id, Contact.phone_number == phone_number)
        )
        if contact:
            if name and name != contact.name:
                contact.name = name
                self.db.flush()
            return contact

        contact = Contact(company_id=company_id, phone_number=phone_number, name=name)
        self.db.add(contact)
        self.db.flush()
        return contact

    def get_open_conversation(
        self,
        *,
        company_id: int,
        contact_id: int,
        whatsapp_instance_id: int | None,
    ) -> Conversation | None:
        return self.db.scalar(
            select(Conversation)
            .where(
                Conversation.company_id == company_id,
                Conversation.contact_id == contact_id,
                Conversation.whatsapp_instance_id == whatsapp_instance_id,
                Conversation.status.in_(["open", "human_handoff"]),
            )
            .order_by(Conversation.updated_at.desc())
        )

    def create_conversation(
        self,
        *,
        company_id: int,
        contact_id: int,
        whatsapp_instance_id: int | None,
    ) -> Conversation:
        now = datetime.now(UTC)
        conversation = Conversation(
            company_id=company_id,
            contact_id=contact_id,
            whatsapp_instance_id=whatsapp_instance_id,
            status="open",
            last_message_at=now,
        )
        self.db.add(conversation)
        self.db.flush()
        return conversation

    def list_conversations(self, company_id: int) -> list[dict]:
        last_message_preview = (
            select(Message.content)
            .where(Message.company_id == company_id, Message.conversation_id == Conversation.id)
            .order_by(Message.created_at.desc(), Message.id.desc())
            .limit(1)
            .scalar_subquery()
        )
        last_message_direction = (
            select(Message.direction)
            .where(Message.company_id == company_id, Message.conversation_id == Conversation.id)
            .order_by(Message.created_at.desc(), Message.id.desc())
            .limit(1)
            .scalar_subquery()
        )

        rows = self.db.execute(
            select(
                Conversation,
                Contact.name.label("contact_name"),
                Contact.phone_number.label("contact_phone_number"),
                last_message_preview.label("last_message_preview"),
                last_message_direction.label("last_message_direction"),
            )
            .join(Contact, Contact.id == Conversation.contact_id)
            .where(Conversation.company_id == company_id)
            .order_by(Conversation.updated_at.desc())
        ).all()

        items: list[dict] = []
        for row in rows:
            conversation = row[0]
            items.append(
                {
                    "id": conversation.id,
                    "company_id": conversation.company_id,
                    "contact_id": conversation.contact_id,
                    "whatsapp_instance_id": conversation.whatsapp_instance_id,
                    "assigned_user_id": conversation.assigned_user_id,
                    "status": conversation.status,
                    "bot_enabled": conversation.bot_enabled,
                    "human_handoff_active": conversation.human_handoff_active,
                    "internal_notes": conversation.internal_notes,
                    "tags": conversation.tags,
                    "last_message_at": conversation.last_message_at,
                    "created_at": conversation.created_at,
                    "updated_at": conversation.updated_at,
                    "contact_name": row.contact_name,
                    "contact_phone_number": row.contact_phone_number,
                    "last_message_preview": row.last_message_preview,
                    "last_message_direction": row.last_message_direction,
                }
            )
        return items

    def get_conversation(self, company_id: int, conversation_id: int) -> Conversation | None:
        return self.db.scalar(
            select(Conversation).where(
                Conversation.company_id == company_id,
                Conversation.id == conversation_id,
            )
        )

    def create_message(
        self,
        *,
        company_id: int,
        contact_id: int,
        conversation_id: int,
        whatsapp_instance_id: int | None,
        direction: str,
        content: str,
        provider_message_id: str | None = None,
        ai_generated: bool = False,
        metadata_json: dict | None = None,
    ) -> Message:
        message = Message(
            company_id=company_id,
            contact_id=contact_id,
            conversation_id=conversation_id,
            whatsapp_instance_id=whatsapp_instance_id,
            direction=direction,
            content=content,
            provider_message_id=provider_message_id,
            ai_generated=ai_generated,
            metadata_json=metadata_json,
        )
        self.db.add(message)
        conversation = self.db.get(Conversation, conversation_id)
        if conversation:
            now = datetime.now(UTC)
            conversation.last_message_at = now
            conversation.updated_at = now
        self.db.flush()
        return message

    def list_messages(self, company_id: int, conversation_id: int) -> list[Message]:
        return list(
            self.db.scalars(
                select(Message)
                .where(Message.company_id == company_id, Message.conversation_id == conversation_id)
                .order_by(Message.created_at.asc())
            ).all()
        )

    def get_message(self, company_id: int, message_id: int) -> Message | None:
        return self.db.scalar(
            select(Message).where(Message.company_id == company_id, Message.id == message_id)
        )

    def get_recent_messages(self, company_id: int, contact_id: int, limit: int) -> list[Message]:
        items = list(
            self.db.scalars(
                select(Message)
                .where(Message.company_id == company_id, Message.contact_id == contact_id)
                .order_by(Message.created_at.desc())
                .limit(limit)
            ).all()
        )
        items.reverse()
        return items

    def message_exists(self, company_id: int, provider_message_id: str | None) -> bool:
        if not provider_message_id:
            return False
        return (
            self.db.scalar(
                select(Message.id).where(
                    Message.company_id == company_id,
                    Message.provider_message_id == provider_message_id,
                )
            )
            is not None
        )

    def find_by_provider_message_id(self, company_id: int, provider_message_id: str) -> Message | None:
        return self.db.scalar(
            select(Message).where(
                Message.company_id == company_id,
                Message.provider_message_id == provider_message_id,
            )
        )
