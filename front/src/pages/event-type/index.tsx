import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventType } from '@/entities/event-type';
import { useSlots } from '@/entities/slot';
import { useCreateBooking } from '@/features/create-booking';
import { SlotsCalendar } from '@/widgets/slots-calendar';
import { BookingForm } from '@/widgets/booking-form';
import type { components } from '@/shared/api/types';

type Slot = components['schemas']['Slot'];

export function EventTypePage() {
  const { eventTypeId = '' } = useParams();
  const navigate = useNavigate();
  const { data: eventType, isLoading: loadingType } = useEventType(eventTypeId);
  const { data: slotsData, isLoading: loadingSlots } = useSlots(eventTypeId);
  const createBooking = useCreateBooking();
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  if (loadingType || loadingSlots) {
    return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  if (!eventType) {
    return <div className="p-8 text-center">Тип события не найден</div>;
  }

  const handleSubmit = (guest: components['schemas']['Guest']) => {
    if (!selectedSlot) return;
    createBooking.mutate(
      {
        eventTypeId,
        payload: { start: selectedSlot.start, guest },
      },
      {
        onSuccess: (booking) => {
          navigate(`/bookings/${booking.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">{eventType.title}</h1>
        <p className="text-muted-foreground">{eventType.description}</p>
        <p className="text-sm text-muted-foreground">{eventType.durationMinutes} мин</p>
      </div>

      {slotsData && (
        <SlotsCalendar
          days={slotsData.days}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />
      )}

      <BookingForm
        slot={selectedSlot}
        onSubmit={handleSubmit}
        isPending={createBooking.isPending}
      />
    </div>
  );
}
