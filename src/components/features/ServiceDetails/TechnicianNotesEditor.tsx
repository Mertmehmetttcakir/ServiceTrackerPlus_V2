import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Text,
    Textarea,
    useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';

interface TechnicianNotesEditorProps {
  notes: string | undefined;
  onSave: (notes: string) => Promise<boolean>;
  isReadOnly?: boolean;
}

export const TechnicianNotesEditor: React.FC<TechnicianNotesEditorProps> = ({
  notes,
  onSave,
  isReadOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleEdit = () => {
    setNoteText(notes || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setNoteText(notes || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await onSave(noteText);
      if (success) {
        setIsEditing(false);
        toast({
          title: 'Notlar kaydedildi',
          status: 'success',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Hata',
          description: 'Notlar kaydedilirken bir hata oluştu',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Notlar kaydedilirken bir hata oluştu',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Box>
        <FormControl>
          <FormLabel>Teknisyen Notları</FormLabel>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Teknik notlar, gözlemler ve öneriler..."
            size="md"
            minHeight="200px"
            mb={4}
          />
        </FormControl>
        <HStack spacing={2} justifyContent="flex-end">
          <Button
            leftIcon={<CloseIcon />}
            onClick={handleCancel}
            size="sm"
            variant="outline"
          >
            İptal
          </Button>
          <Button
            leftIcon={<CheckIcon />}
            onClick={handleSave}
            size="sm"
            colorScheme="blue"
            isLoading={isSaving}
          >
            Kaydet
          </Button>
        </HStack>
      </Box>
    );
  }

  return (
    <Box p={4} bg="gray.50" borderRadius="md">
      <HStack justifyContent="space-between" mb={2}>
        <Heading size="sm">Teknisyen Notları</Heading>
        {!isReadOnly && (
          <Button
            leftIcon={<EditIcon />}
            onClick={handleEdit}
            size="xs"
            variant="outline"
          >
            Düzenle
          </Button>
        )}
      </HStack>
      <Text whiteSpace="pre-wrap">
        {notes || 'Bu servis kaydı için not bulunmamaktadır.'}
      </Text>
    </Box>
  );
}; 