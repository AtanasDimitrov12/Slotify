import {
  createStage,
  createTicket,
  deleteStage,
  deleteTicket,
  finishTicket,
  getStages,
  getTickets,
  RichTextSection,
  type Stage,
  startTicket,
  type Ticket,
  type TicketBadge,
  type TicketPriority,
  type TicketStage,
  type TicketType,
  updateStage,
  updateTicket,
} from '@barber/shared';
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FeaturePlayListRoundedIcon from '@mui/icons-material/FeaturedPlayListRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import * as React from 'react';

const PRIORITY_CONFIG: Record<TicketPriority, { color: string; bg: string }> = {
  low: { color: '#64748B', bg: '#F1F5F9' },
  medium: { color: '#0EA5E9', bg: '#F0F9FF' },
  high: { color: '#F59E0B', bg: '#FFFBEB' },
  urgent: { color: '#EF4444', bg: '#FEF2F2' },
};

const TYPE_ICONS: Record<TicketType, React.ReactNode> = {
  bugfix: <BugReportRoundedIcon sx={{ fontSize: 16 }} />,
  feature: <FeaturePlayListRoundedIcon sx={{ fontSize: 16 }} />,
  request: <RequestQuoteRoundedIcon sx={{ fontSize: 16 }} />,
  question: <HelpRoundedIcon sx={{ fontSize: 16 }} />,
};

const BADGE_CONFIG: Record<TicketBadge, { label: string; color: string }> = {
  info_needed: { label: 'Info Needed', color: '#64748B' },
  blocked: { label: 'Blocked', color: '#EF4444' },
  requested_changes: { label: 'Changes Requested', color: '#F59E0B' },
  hold: { label: 'On Hold', color: '#94A3B8' },
  has_pr: { label: 'Has PR', color: '#10B981' },
  awaiting_feedback: { label: 'Feedback', color: '#3B82F6' },
};

interface TicketCardProps {
  ticket: Ticket;
  onStart?: (id: string) => void;
  onFinish?: (id: string) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete?: (id: string) => void;
  isDragging?: boolean;
}

const TicketCard = React.forwardRef<
  HTMLDivElement,
  TicketCardProps & {
    dragHandleProps?: Record<string, unknown>;
  }
>(({ ticket, onStart, onFinish, onEdit, onDelete, isDragging, dragHandleProps }, ref) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const priority = PRIORITY_CONFIG[ticket.priority];

  return (
    <Card
      ref={ref}
      elevation={0}
      sx={{
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: isDragging ? alpha('#0EA5E9', 0.5) : '#E2E8F0',
        bgcolor: '#FFFFFF',
        transition: 'all 0.2s ease-in-out',
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
        '&:hover': {
          borderColor: '#CBD5E1',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transform: isDragging ? 'none' : 'translateY(-1px)',
        },
        '&:active': { cursor: 'grabbing' },
      }}
      onClick={() => onEdit(ticket)}
      {...dragHandleProps}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          {/* Labels/Badges at the top like Trello */}
          {(ticket.badges.length > 0 || ticket.priority !== 'medium') && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
              {ticket.priority !== 'medium' && (
                <Box
                  sx={{
                    width: 32,
                    height: 6,
                    borderRadius: 1,
                    bgcolor: priority.color,
                    opacity: 0.8,
                  }}
                />
              )}
              {ticket.badges.map((badge) => (
                <Box
                  key={badge}
                  sx={{
                    width: 32,
                    height: 6,
                    borderRadius: 1,
                    bgcolor: BADGE_CONFIG[badge].color,
                    opacity: 0.6,
                  }}
                />
              ))}
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: 14,
                color: '#1E293B',
                lineHeight: 1.4,
                flex: 1,
              }}
            >
              <Box component="span" sx={{ color: '#94A3B8', mr: 1, fontWeight: 600, fontSize: 12 }}>
                {ticket.code}
              </Box>
              {ticket.title}
            </Typography>
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{
                p: 0.2,
                mt: -0.5,
                mr: -0.5,
                color: '#94A3B8',
                opacity: 0,
                '.MuiCard-root:hover &': { opacity: 1 },
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: '#94A3B8', display: 'flex' }}>{TYPE_ICONS[ticket.type]}</Box>
              {ticket.description && ticket.description !== '<p><br></p>' && (
                <Tooltip title="This ticket has a description">
                  <Box sx={{ color: '#94A3B8', display: 'flex' }}>
                    <NotesRoundedIcon sx={{ fontSize: 14 }} />
                  </Box>
                </Tooltip>
              )}
            </Stack>

            <Box onPointerDown={(e) => e.stopPropagation()}>
              {ticket.stage !== 'in_progress' && ticket.stage !== 'done' && onStart && (
                <Button
                  size="small"
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(ticket._id);
                  }}
                  sx={{
                    minWidth: 0,
                    p: '2px 6px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#10B981',
                    '&:hover': { bgcolor: alpha('#10B981', 0.05) },
                  }}
                >
                  START
                </Button>
              )}
              {ticket.stage === 'in_progress' && onFinish && (
                <Button
                  size="small"
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFinish(ticket._id);
                  }}
                  sx={{
                    minWidth: 0,
                    p: '2px 6px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#3B82F6',
                    '&:hover': { bgcolor: alpha('#3B82F6', 0.05) },
                  }}
                >
                  FINISH
                </Button>
              )}
            </Box>
          </Stack>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          elevation={2}
          PaperProps={{
            sx: { borderRadius: 1.5, minWidth: 140, border: '1px solid #E2E8F0' },
          }}
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              onEdit(ticket);
            }}
            sx={{ fontSize: 13, fontWeight: 600 }}
          >
            Edit Ticket
          </MenuItem>
          {onDelete && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClose();
                onDelete(ticket._id);
              }}
              sx={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}
            >
              Delete
            </MenuItem>
          )}
        </Menu>
      </CardContent>
    </Card>
  );
});

function SortableTicket(props: TicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.ticket._id,
    data: {
      type: 'Ticket',
      ticket: props.ticket,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <TicketCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </Box>
  );
}

const COLUMN_COLORS = [
  '#F8FAFC', // Slate (Default)
  '#ff00008f', // Red (Stronger)
  '#ffcc008e', // Amber (Stronger)
  '#00ff5981', // Green (Stronger)
  '#006eff8c', // Blue (Stronger)
  '#623fff91', // Purple (Stronger)
  '#f700ff7e', // Pink (Stronger)
  '#ff910080', // Orange (Stronger)
];

function DroppableColumn({
  id,
  children,
  isCollapsed,
  color,
  label,
}: {
  id: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  color?: string;
  label?: string;
}) {
  const { setNodeRef } = useDroppable({ id });

  if (isCollapsed) {
    return (
      <Box
        ref={setNodeRef}
        sx={{
          width: '100%',
          bgcolor: color || '#F8FAFC',
          borderRadius: 2,
          flex: 1,
          minHeight: 'calc(100vh - 280px)',
          border: '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 2,
          transition: 'background-color 0.2s',
        }}
      >
        <Typography
          sx={{
            writingMode: 'vertical-rl',
            textTransform: 'uppercase',
            fontWeight: 800,
            fontSize: 11,
            color: '#64748B',
            letterSpacing: 1.5,
            opacity: 0.8,
            userSelect: 'none',
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      ref={setNodeRef}
      spacing={1.5}
      sx={{
        p: 1.5,
        bgcolor: color || '#F8FAFC',
        borderRadius: 2,
        minHeight: 'calc(100vh - 280px)',
        border: '1px solid #F1F5F9',
        transition: 'background-color 0.2s',
      }}
    >
      {children}
    </Stack>
  );
}

export default function TicketsPage() {
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [stages, setStages] = React.useState<Stage[]>([]);
  const [open, setOpen] = React.useState(false);
  const [stageDialogOpen, setStageDialogOpen] = React.useState(false);
  const [editingTicket, setEditingTicket] = React.useState<Ticket | null>(null);
  const [activeTicket, setActiveTicket] = React.useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const [colorMenuAnchor, setColorMenuAnchor] = React.useState<{
    el: HTMLElement;
    stageId: string;
  } | null>(null);

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    userStories: '',
    acceptanceCriteria: '',
    nonTechnicalAcceptanceCriteria: '',
    priority: 'medium' as TicketPriority,
    type: 'feature' as TicketType,
    stage: 'internal' as TicketStage,
    badges: [] as TicketBadge[],
  });

  const [stageFormData, setStageFormData] = React.useState({
    name: '',
    label: '',
  });

  const fetchStages = React.useCallback(async () => {
    try {
      const data = await getStages();
      setStages(data);
    } catch (err) {
      console.error('Failed to fetch stages:', err);
    }
  }, []);

  const fetchTickets = React.useCallback(async () => {
    try {
      const data = await getTickets({ search: searchQuery });
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    fetchStages();
    fetchTickets();
  }, [fetchStages, fetchTickets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Allow 5px of movement before starting drag to allow clicking
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Ticket') {
      setActiveTicket(event.active.data.current.ticket);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // We can use this to update state locally during drag for smooth UI
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTicket(null);
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id as string;
    const overId = over.id as string;

    // overId can be a stage name (column) or another ticket's ID.
    let targetStage: string | null = null;
    const matchedStage = stages.find((s) => s.name === overId);
    if (matchedStage) {
      targetStage = matchedStage.name;
    } else {
      const overTicket = tickets.find((t) => t._id === overId);
      if (overTicket) {
        targetStage = overTicket.stage;
      }
    }

    if (targetStage && targetStage !== active.data.current?.ticket.stage) {
      try {
        // Trigger specific logic based on target stage
        if (targetStage === 'in_progress') {
          await startTicket(ticketId);
        } else if (targetStage === 'done') {
          await finishTicket(ticketId);
        } else {
          await updateTicket(ticketId, { stage: targetStage });
        }
        fetchTickets();
      } catch (err) {
        console.error('Failed to update ticket stage:', err);
      }
    }
  };

  const handleOpen = (ticketOrStage?: Ticket | string) => {
    if (ticketOrStage && typeof ticketOrStage === 'object' && '_id' in ticketOrStage) {
      const ticket = ticketOrStage as Ticket;
      setEditingTicket(ticket);
      setFormData({
        title: ticket.title,
        description: ticket.description || '',
        userStories: ticket.userStories || '',
        acceptanceCriteria: ticket.acceptanceCriteria || '',
        nonTechnicalAcceptanceCriteria: ticket.nonTechnicalAcceptanceCriteria || '',
        priority: ticket.priority,
        type: ticket.type,
        stage: ticket.stage,
        badges: ticket.badges,
      });
    } else {
      setEditingTicket(null);
      setFormData({
        title: '',
        description: '',
        userStories: '',
        acceptanceCriteria: '',
        nonTechnicalAcceptanceCriteria: '',
        priority: 'medium',
        type: 'feature',
        stage: typeof ticketOrStage === 'string' ? ticketOrStage : stages[0]?.name || 'internal',
        badges: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      if (editingTicket) {
        await updateTicket(editingTicket._id, formData);
      } else {
        await createTicket(formData);
      }
      handleClose();
      fetchTickets();
    } catch (err) {
      console.error('Failed to save ticket:', err);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startTicket(id);
      fetchTickets();
    } catch (err) {
      console.error('Failed to start ticket:', err);
    }
  };

  const handleFinish = async (id: string) => {
    try {
      await finishTicket(id);
      fetchTickets();
    } catch (err) {
      console.error('Failed to finish ticket:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await deleteTicket(id);
      fetchTickets();
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    }
  };

  const handleDeleteStage = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure? This will delete the collection. Tickets in this collection will stay in the DB but won't be visible here until assigned to another collection.",
      )
    )
      return;
    try {
      await deleteStage(id);
      fetchStages();
    } catch (err) {
      console.error('Failed to delete stage:', err);
    }
  };

  const handleCreateStage = async () => {
    try {
      await createStage(stageFormData);
      setStageDialogOpen(false);
      setStageFormData({ name: '', label: '' });
      fetchStages();
    } catch (err) {
      console.error('Failed to create stage:', err);
    }
  };

  const toggleCollapse = async (stage: Stage) => {
    try {
      await updateStage(stage._id, { isCollapsed: !stage.isCollapsed });
      fetchStages();
    } catch (err) {
      console.error('Failed to toggle stage collapse:', err);
    }
  };

  const handleColorClick = (event: React.MouseEvent<HTMLElement>, stageId: string) => {
    setColorMenuAnchor({ el: event.currentTarget, stageId });
  };

  const handleColorSelect = async (color: string) => {
    if (colorMenuAnchor) {
      try {
        await updateStage(colorMenuAnchor.stageId, { color });
        fetchStages();
      } catch (err) {
        console.error('Failed to update stage color:', err);
      }
      setColorMenuAnchor(null);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 30, letterSpacing: -0.5, color: '#0F172A' }}>
            Product Backlog
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 500, fontSize: 16, mb: 2 }}>
            Orchestrate features, bugfixes and requests.
          </Typography>
          <TextField
            placeholder="Search by title or SLT ID..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: '100%',
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => setStageDialogOpen(true)}
            sx={{
              borderRadius: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#64748B',
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            Manage Collections
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddRoundedIcon />}
            onClick={() => handleOpen()}
            sx={{
              bgcolor: '#0F172A',
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              fontWeight: 600,
              fontSize: 14,
              textTransform: 'none',
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            New Ticket
          </Button>
        </Stack>
      </Stack>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ overflowX: 'auto', mx: -2, px: 2 }}>
          <Stack direction="row" spacing={2.5} sx={{ minWidth: 1200 }}>
            {stages.map((stage) => {
              const isCollapsed = stage.isCollapsed;
              const color = stage.color;
              const colTickets = tickets.filter((t) => t.stage === stage.name);

              return (
                <Box
                  key={stage._id}
                  sx={{
                    flex: isCollapsed ? '0 0 52px' : '1 1 300px',
                    minWidth: isCollapsed ? 52 : 280,
                    maxWidth: isCollapsed ? 52 : 360,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack
                    direction={isCollapsed ? 'column' : 'row'}
                    spacing={1}
                    alignItems="center"
                    justifyContent={isCollapsed ? 'flex-start' : 'space-between'}
                    sx={{ mb: 2, px: 1, minHeight: 32 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {!isCollapsed && (
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {stage.label}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: '#94A3B8',
                          bgcolor: '#F1F5F9',
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                        }}
                      >
                        {colTickets.length}
                      </Typography>
                    </Stack>

                    <Stack direction={isCollapsed ? 'column' : 'row'} spacing={0.5}>
                      {!isCollapsed && (
                        <Tooltip title="Add Ticket">
                          <IconButton size="small" onClick={() => handleOpen(stage.name)}>
                            <AddRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Change Color">
                        <IconButton size="small" onClick={(e) => handleColorClick(e, stage._id)}>
                          <PaletteRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isCollapsed ? 'Expand' : 'Collapse'}>
                        <IconButton size="small" onClick={() => toggleCollapse(stage)}>
                          {isCollapsed ? (
                            <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                          ) : (
                            <ExpandLessRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <SortableContext
                    id={stage.name}
                    items={colTickets.map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn
                      id={stage.name}
                      isCollapsed={isCollapsed}
                      color={color}
                      label={stage.label}
                    >
                      {!isCollapsed &&
                        colTickets.map((ticket) => (
                          <SortableTicket
                            key={ticket._id}
                            ticket={ticket}
                            onStart={handleStart}
                            onFinish={handleFinish}
                            onEdit={handleOpen}
                            onDelete={handleDelete}
                          />
                        ))}
                    </DroppableColumn>
                  </SortableContext>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <DragOverlay>
          {activeTicket ? <TicketCard ticket={activeTicket} onEdit={() => {}} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <Menu
        anchorEl={colorMenuAnchor?.el}
        open={Boolean(colorMenuAnchor)}
        onClose={() => setColorMenuAnchor(null)}
      >
        <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {COLUMN_COLORS.map((color) => (
            <Box
              key={color}
              onClick={() => handleColorSelect(color)}
              sx={{
                width: 24,
                height: 24,
                bgcolor: color,
                borderRadius: 1,
                cursor: 'pointer',
                border: '1px solid #E2E8F0',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          ))}
        </Box>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            bgcolor: '#F8FAFC',
          },
        }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 800, fontSize: 24, color: '#0F172A' }}>
              {editingTicket ? `Edit Ticket: ${editingTicket.code}` : 'Create New Ticket'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <MoreVertRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <Grid container spacing={3}>
            {/* Main Content Column */}
            <Grid item xs={12} md={8}>
              <Box sx={{ bgcolor: '#FFFFFF', p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    variant="standard"
                    placeholder="Enter ticket title..."
                    InputProps={{
                      disableUnderline: false,
                      sx: {
                        fontSize: 20,
                        fontWeight: 700,
                        '&:before, &:after': { borderColor: '#E2E8F0' },
                      },
                    }}
                    InputLabelProps={{ shrink: true, sx: { fontWeight: 700, fontSize: 14 } }}
                  />

                  <RichTextSection
                    label="User Stories"
                    value={formData.userStories}
                    onChange={(val) => setFormData({ ...formData, userStories: val })}
                    placeholder="As a user, I want to..."
                  />

                  <RichTextSection
                    label="Technical Description"
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Explain the technical implementation details..."
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} lg={6}>
                      <RichTextSection
                        label="Technical Acceptance Criteria"
                        value={formData.acceptanceCriteria}
                        onChange={(val) => setFormData({ ...formData, acceptanceCriteria: val })}
                        placeholder="List the technical requirements for completion..."
                      />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <RichTextSection
                        label="Non-Technical / Business Value"
                        value={formData.nonTechnicalAcceptanceCriteria}
                        onChange={(val) =>
                          setFormData({ ...formData, nonTechnicalAcceptanceCriteria: val })
                        }
                        placeholder="What is the business impact or user value?"
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            </Grid>

            {/* Sidebar Column */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2.5}>
                <Box
                  sx={{ bgcolor: '#FFFFFF', p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0' }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#64748B', mb: 2 }}>
                    METADATA
                  </Typography>
                  <Stack spacing={2.5}>
                    <FormControl fullWidth size="small">
                      <InputLabel shrink>Priority</InputLabel>
                      <Select
                        notched
                        value={formData.priority}
                        label="Priority"
                        onChange={(e) =>
                          setFormData({ ...formData, priority: e.target.value as TicketPriority })
                        }
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel shrink>Type</InputLabel>
                      <Select
                        notched
                        value={formData.type}
                        label="Type"
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as TicketType })
                        }
                      >
                        <MenuItem value="bugfix">Bugfix</MenuItem>
                        <MenuItem value="feature">Feature</MenuItem>
                        <MenuItem value="request">Request</MenuItem>
                        <MenuItem value="question">Question</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel shrink>Stage</InputLabel>
                      <Select
                        notched
                        value={formData.stage}
                        label="Stage"
                        onChange={(e) =>
                          setFormData({ ...formData, stage: e.target.value as TicketStage })
                        }
                      >
                        {stages.map((stage) => (
                          <MenuItem key={stage._id} value={stage.name}>
                            {stage.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>

                <Box
                  sx={{ bgcolor: '#FFFFFF', p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0' }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#64748B', mb: 2 }}>
                    LABELS & BADGES
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      multiple
                      displayEmpty
                      value={formData.badges}
                      onChange={(e) =>
                        setFormData({ ...formData, badges: e.target.value as TicketBadge[] })
                      }
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return (
                            <Typography sx={{ color: '#94A3B8', fontSize: 14 }}>
                              Select badges...
                            </Typography>
                          );
                        }
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as TicketBadge[]).map((value) => (
                              <Chip
                                key={value}
                                label={BADGE_CONFIG[value].label}
                                size="small"
                                sx={{
                                  height: 24,
                                  borderRadius: 1,
                                  bgcolor: alpha(BADGE_CONFIG[value].color, 0.1),
                                  color: BADGE_CONFIG[value].color,
                                  fontWeight: 600,
                                  fontSize: 11,
                                }}
                              />
                            ))}
                          </Box>
                        );
                      }}
                    >
                      {(Object.keys(BADGE_CONFIG) as TicketBadge[]).map((badge) => (
                        <MenuItem key={badge} value={badge} sx={{ fontSize: 13, fontWeight: 500 }}>
                          {BADGE_CONFIG[badge].label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
          <Button
            onClick={handleClose}
            sx={{ fontWeight: 600, color: '#64748B', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disableElevation
            sx={{
              bgcolor: '#0F172A',
              borderRadius: 1.5,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            {editingTicket ? 'Save Changes' : 'Create Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stage Management Dialog */}
      <Dialog
        open={stageDialogOpen}
        onClose={() => setStageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20, pt: 3, pb: 1 }}>
          Manage Collections
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#64748B', mb: 2 }}>
                ADD NEW COLLECTION
              </Typography>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <TextField
                  label="Label"
                  size="small"
                  fullWidth
                  value={stageFormData.label}
                  onChange={(e) => setStageFormData({ ...stageFormData, label: e.target.value })}
                  placeholder="e.g. In Review"
                />
                <TextField
                  label="ID"
                  size="small"
                  fullWidth
                  value={stageFormData.name}
                  onChange={(e) => setStageFormData({ ...stageFormData, name: e.target.value })}
                  placeholder="e.g. in_review"
                />
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleCreateStage}
                  disabled={!stageFormData.name || !stageFormData.label}
                  sx={{
                    bgcolor: '#0F172A',
                    borderRadius: 1.5,
                    px: 3,
                    height: 40,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#64748B', mb: 2 }}>
                CURRENT COLLECTIONS
              </Typography>
              <Stack spacing={1}>
                {stages.map((stage) => (
                  <Stack
                    key={stage._id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: stage.color,
                          border: '1px solid #E2E8F0',
                        }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1E293B' }}>
                          {stage.label}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>
                          ID: {stage.name}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      size="small"
                      onClick={() => handleDeleteStage(stage._id)}
                      sx={{ color: '#EF4444', fontWeight: 700, fontSize: 12 }}
                    >
                      DELETE
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F8FAFC' }}>
          <Button
            onClick={() => setStageDialogOpen(false)}
            sx={{ fontWeight: 600, color: '#64748B', textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
