"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Event {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  location: string;
  coverImage: string;
  eventDate: string;
  countdownDate: string | null;
  featuredContestants: string[] | null;
  ticketLink: string | null;
  isGrandFinale: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

interface Contestant {
  id: string;
  fullName: string | null;
  user: {
    fullName: string;
  };
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [grandFinale, setGrandFinale] = useState<Event | null>(null);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Normal event dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    coverImage: "",
    eventDate: "",
    isPublished: false,
    isFeatured: false,
  });

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  // Grand Finale form state
  const [finaleForm, setFinaleForm] = useState({
    id: "",
    title: "",
    subtitle: "",
    description: "",
    location: "",
    coverImage: "",
    eventDate: "",
    countdownDate: "",
    ticketLink: "",
    isPublished: false,
    isFeatured: false,
    featuredContestants: [] as string[],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch regular events
      const eventsRes = await fetch("/api/admin/events?isGrandFinale=false");
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData || []);
      }

      // 2. Fetch grand finale
      const finaleRes = await fetch("/api/admin/events?isGrandFinale=true");
      if (finaleRes.ok) {
        const finaleData = await finaleRes.json();
        setGrandFinale(finaleData);
        if (finaleData) {
          setFinaleForm({
            id: finaleData.id,
            title: finaleData.title || "",
            subtitle: finaleData.subtitle || "",
            description: finaleData.description || "",
            location: finaleData.location || "",
            coverImage: finaleData.coverImage || "",
            eventDate: finaleData.eventDate ? new Date(finaleData.eventDate).toISOString().slice(0, 16) : "",
            countdownDate: finaleData.countdownDate ? new Date(finaleData.countdownDate).toISOString().slice(0, 16) : "",
            ticketLink: finaleData.ticketLink || "",
            isPublished: finaleData.isPublished || false,
            isFeatured: finaleData.isFeatured || false,
            featuredContestants: finaleData.featuredContestants || [],
          });
        }
      }

      // 3. Fetch contestants (for grand finale selector)
      const contestantsRes = await fetch("/api/admin/contestants");
      if (contestantsRes.ok) {
        const contestantsData = await contestantsRes.json();
        setContestants(contestantsData || []);
      }
    } catch (err) {
      console.error("Failed to fetch event data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Event Dialog for Create
  const handleOpenCreate = () => {
    setSelectedEvent(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      coverImage: "",
      eventDate: "",
      isPublished: false,
      isFeatured: false,
    });
    setDialogOpen(true);
  };

  // Open Event Dialog for Edit
  const handleOpenEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      coverImage: event.coverImage,
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      isPublished: event.isPublished,
      isFeatured: event.isFeatured,
    });
    setDialogOpen(true);
  };

  // Handle regular event Save
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        isGrandFinale: false,
      };

      const method = selectedEvent ? "PUT" : "POST";
      const url = "/api/admin/events";
      const body = selectedEvent ? { id: selectedEvent.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setDialogOpen(false);
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save event");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the event.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/events?id=${eventToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteDialogOpen(false);
        setEventToDelete(null);
        await fetchData();
      } else {
        alert("Failed to delete event.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Publish Toggle
  const handleTogglePublish = async (event: Event) => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id, isPublished: !event.isPublished }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Grand Finale Settings
  const handleSaveGrandFinale = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        title: finaleForm.title,
        subtitle: finaleForm.subtitle,
        description: finaleForm.description,
        location: finaleForm.location,
        coverImage: finaleForm.coverImage,
        eventDate: finaleForm.eventDate,
        countdownDate: finaleForm.countdownDate || null,
        ticketLink: finaleForm.ticketLink || null,
        featuredContestants: finaleForm.featuredContestants,
        isGrandFinale: true,
        isPublished: finaleForm.isPublished,
        isFeatured: finaleForm.isFeatured,
      };

      const method = grandFinale ? "PUT" : "POST";
      const body = grandFinale ? { id: grandFinale.id, ...payload } : payload;

      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert("Grand Finale settings saved successfully!");
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save Grand Finale settings");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving Grand Finale settings.");
    } finally {
      setActionLoading(false);
    }
  };

  // Contestant selection handler
  const handleToggleContestant = (contestantId: string) => {
    setFinaleForm((prev) => {
      const current = prev.featuredContestants || [];
      if (current.includes(contestantId)) {
        return {
          ...prev,
          featuredContestants: current.filter((id) => id !== contestantId),
        };
      } else {
        return {
          ...prev,
          featuredContestants: [...current, contestantId],
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" /> Events & Grand Finale
          </h1>
          <p className="mt-1 text-sm text-dark-6">
            Manage upcoming promotional events and the grand countdown settings.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Regular Events</TabsTrigger>
          <TabsTrigger value="finale" className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" /> Grand Finale Settings
          </TabsTrigger>
        </TabsList>

        {/* Regular Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleOpenCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          </div>

          <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
            {events.length === 0 ? (
              <div className="py-20 text-center text-dark-6">
                <p>No regular events created yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stroke dark:border-dark-3">
                      <th className="px-6 py-4 text-left font-medium text-dark-6">Event Details</th>
                      <th className="px-6 py-4 text-left font-medium text-dark-6">Date & Time</th>
                      <th className="px-6 py-4 text-left font-medium text-dark-6">Location</th>
                      <th className="px-6 py-4 text-left font-medium text-dark-6">Status</th>
                      <th className="px-6 py-4 text-right font-medium text-dark-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
                      >
                        <td className="px-6 py-4 font-medium text-dark dark:text-white">
                          <div>
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-xs text-dark-6 line-clamp-1 max-w-[250px]">{event.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-dark-6">
                          {new Date(event.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 text-dark-6 flex items-center gap-1.5 mt-2.5 border-0">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <span>{event.location}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleTogglePublish(event)}
                            className="cursor-pointer transition-opacity hover:opacity-80"
                          >
                            {event.isPublished ? (
                              <Badge variant="default" className="bg-emerald-600 text-white">
                                <CheckCircle className="mr-1 h-3.5 w-3.5" /> Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="mr-1 h-3.5 w-3.5 text-dark-6" /> Draft
                              </Badge>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-dark-6"
                              onClick={() => handleOpenEdit(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEventToDelete(event);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Grand Finale Settings Tab */}
        <TabsContent value="finale">
          <form onSubmit={handleSaveGrandFinale} className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark space-y-6">
            <div className="flex items-center gap-3 border-b border-stroke pb-4 dark:border-dark-3">
              <Trophy className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-dark dark:text-white">Official Grand Finale Config</h3>
                <p className="text-xs text-dark-6">Configure the primary homepage finale event and countdown parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="finaleTitle">Finale Event Title</Label>
                  <Input
                    id="finaleTitle"
                    value={finaleForm.title}
                    onChange={(e) => setFinaleForm({ ...finaleForm, title: e.target.value })}
                    placeholder="e.g. Grand Finale — Miss Somali 2026"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="finaleSubtitle">Subtitle</Label>
                  <Input
                    id="finaleSubtitle"
                    value={finaleForm.subtitle}
                    onChange={(e) => setFinaleForm({ ...finaleForm, subtitle: e.target.value })}
                    placeholder="e.g. The crowning night"
                  />
                </div>

                <div>
                  <Label htmlFor="finaleVenue">Venue / Location</Label>
                  <Input
                    id="finaleVenue"
                    value={finaleForm.location}
                    onChange={(e) => setFinaleForm({ ...finaleForm, location: e.target.value })}
                    placeholder="e.g. Royal Palace Hall, Mogadishu"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="finaleCover">Hero Image Banner URL</Label>
                  <Input
                    id="finaleCover"
                    value={finaleForm.coverImage}
                    onChange={(e) => setFinaleForm({ ...finaleForm, coverImage: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="finaleDate">Event Date & Time</Label>
                    <Input
                      type="datetime-local"
                      id="finaleDate"
                      value={finaleForm.eventDate}
                      onChange={(e) => setFinaleForm({ ...finaleForm, eventDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="finaleCountdown">Countdown Target</Label>
                    <Input
                      type="datetime-local"
                      id="finaleCountdown"
                      value={finaleForm.countdownDate}
                      onChange={(e) => setFinaleForm({ ...finaleForm, countdownDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="finaleTicket">Ticket / External Link</Label>
                  <Input
                    id="finaleTicket"
                    value={finaleForm.ticketLink}
                    onChange={(e) => setFinaleForm({ ...finaleForm, ticketLink: e.target.value })}
                    placeholder="e.g. https://tickets.misssomali.com"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="finalePublish"
                      checked={finaleForm.isPublished}
                      onCheckedChange={(checked) => setFinaleForm({ ...finaleForm, isPublished: !!checked })}
                    />
                    <Label htmlFor="finalePublish" className="cursor-pointer font-medium text-dark dark:text-white">
                      Publish Finale Event
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="finaleFeatured"
                      checked={finaleForm.isFeatured}
                      onCheckedChange={(checked) => setFinaleForm({ ...finaleForm, isFeatured: !!checked })}
                    />
                    <Label htmlFor="finaleFeatured" className="cursor-pointer font-medium text-dark dark:text-white">
                      Featured Homepage Event
                    </Label>
                  </div>
                </div>
              </div>

              {/* Right panel: Description & Featured contestants */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="finaleDesc">Description</Label>
                  <Textarea
                    id="finaleDesc"
                    value={finaleForm.description}
                    onChange={(e) => setFinaleForm({ ...finaleForm, description: e.target.value })}
                    placeholder="Provide details about the grand finale ceremony..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Featured Contestants (Select Finalists)</Label>
                  <div className="rounded-lg border border-stroke p-4 dark:border-dark-3 max-h-[300px] overflow-y-auto space-y-3 bg-gray-50 dark:bg-dark-2">
                    {contestants.length === 0 ? (
                      <p className="text-xs text-dark-6">No approved/shortlisted contestants available.</p>
                    ) : (
                      contestants.map((con) => {
                        const name = con.fullName || con.user?.fullName || "Unnamed Contestant";
                        const isChecked = (finaleForm.featuredContestants || []).includes(con.id);
                        return (
                          <div key={con.id} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`con-${con.id}`}
                              checked={isChecked}
                              onCheckedChange={() => handleToggleContestant(con.id)}
                            />
                            <Label htmlFor={`con-${con.id}`} className="cursor-pointer text-sm">
                              {name}
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-dark-6">
                    These finalists will be prominently highlighted under the grand finale sections.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-stroke pt-4 dark:border-dark-3 flex justify-end">
              <Button type="submit" disabled={actionLoading} className="flex items-center gap-2">
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Finale Settings
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>
              Provide event specifics below to schedule and publish Miss Somali promotions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEvent} className="space-y-4">
            <div>
              <Label htmlFor="eventTitle">Event Title</Label>
              <Input
                id="eventTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Contestant Meet & Greet"
                required
              />
            </div>

            <div>
              <Label htmlFor="eventDesc">Description</Label>
              <Textarea
                id="eventDesc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description and details..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="eventLoc">Location</Label>
              <Input
                id="eventLoc"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. National Theater, Mogadishu"
                required
              />
            </div>

            <div>
              <Label htmlFor="eventCover">Cover Image URL</Label>
              <Input
                id="eventCover"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <Label htmlFor="eventDateTime">Date & Time</Label>
              <Input
                type="datetime-local"
                id="eventDateTime"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="eventPublish"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: !!checked })}
              />
              <Label htmlFor="eventPublish" className="cursor-pointer">
                Publish Event Immediately
              </Label>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedEvent ? "Save Changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the event <strong>{eventToDelete?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
