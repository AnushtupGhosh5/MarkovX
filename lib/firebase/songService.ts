import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

export interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

export interface Song {
  song_id: string;
  user_id: string;
  title: string;
  genre?: string;
  mood?: string;
  tempo?: string;
  key?: string;
  style?: string;
  instruments?: string[];
  creation_timestamp: Date;
  last_updated: Date;
  audio_files: string[];
  ai_chat_context: ChatMessage[];
  notes?: string;
  version_number: number;
  preview_audio_url?: string;
}

export interface CreateSongData {
  title: string;
  genre?: string;
  mood?: string;
  tempo?: string;
  key?: string;
  style?: string;
  instruments?: string[];
  notes?: string;
}

const SONGS_COLLECTION = 'songs';

export const songService = {
  // Create a new song
  async createSong(userId: string, songData: CreateSongData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, SONGS_COLLECTION), {
        user_id: userId,
        title: songData.title,
        genre: songData.genre || '',
        mood: songData.mood || '',
        tempo: songData.tempo || '',
        key: songData.key || '',
        style: songData.style || '',
        instruments: songData.instruments || [],
        creation_timestamp: serverTimestamp(),
        last_updated: serverTimestamp(),
        audio_files: [],
        ai_chat_context: [],
        notes: songData.notes || '',
        version_number: 1,
        preview_audio_url: ''
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating song:', error);
      throw new Error('Failed to create song');
    }
  },

  // Get a single song by ID
  async getSong(songId: string): Promise<Song | null> {
    try {
      const docRef = doc(db, SONGS_COLLECTION, songId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          song_id: docSnap.id,
          ...data,
          creation_timestamp: data.creation_timestamp?.toDate() || new Date(),
          last_updated: data.last_updated?.toDate() || new Date(),
          ai_chat_context: data.ai_chat_context?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp)
          })) || []
        } as Song;
      }

      return null;
    } catch (error) {
      console.error('Error getting song:', error);
      throw new Error('Failed to get song');
    }
  },

  // Get all songs for a user
  async getUserSongs(userId: string): Promise<Song[]> {
    try {
      // Query without orderBy to avoid index requirement
      // Songs will be sorted client-side
      const q = query(
        collection(db, SONGS_COLLECTION),
        where('user_id', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const songs: Song[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        songs.push({
          song_id: doc.id,
          ...data,
          creation_timestamp: data.creation_timestamp?.toDate() || new Date(),
          last_updated: data.last_updated?.toDate() || new Date(),
          ai_chat_context: data.ai_chat_context?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp)
          })) || []
        } as Song);
      });

      // Sort by last_updated descending (client-side)
      songs.sort((a, b) => b.last_updated.getTime() - a.last_updated.getTime());

      return songs;
    } catch (error: any) {
      console.error('Error getting user songs:', error);
      
      // Provide more detailed error message
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      } else if (error.message?.includes('index')) {
        throw new Error('Database index required. Please check Firebase Console.');
      }
      
      throw new Error(`Failed to get user songs: ${error.message || 'Unknown error'}`);
    }
  },

  // Update song metadata
  async updateSong(songId: string, updates: Partial<CreateSongData>): Promise<void> {
    try {
      const docRef = doc(db, SONGS_COLLECTION, songId);
      await updateDoc(docRef, {
        ...updates,
        last_updated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating song:', error);
      throw new Error('Failed to update song');
    }
  },

  // Add a chat message to the song
  async addChatMessage(songId: string, message: ChatMessage): Promise<void> {
    try {
      const docRef = doc(db, SONGS_COLLECTION, songId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentContext = docSnap.data().ai_chat_context || [];
        await updateDoc(docRef, {
          ai_chat_context: [...currentContext, {
            ...message,
            timestamp: new Date()
          }],
          last_updated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw new Error('Failed to add chat message');
    }
  },

  // Upload audio file to Firebase Storage
  async uploadAudioFile(
    songId: string,
    userId: string,
    audioBlob: Blob,
    filename: string
  ): Promise<string> {
    try {
      const storageRef = ref(storage, `users/${userId}/songs/${songId}/${filename}`);
      await uploadBytes(storageRef, audioBlob);
      const downloadURL = await getDownloadURL(storageRef);

      // Add the URL to the song's audio_files array
      const docRef = doc(db, SONGS_COLLECTION, songId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentFiles = docSnap.data().audio_files || [];
        await updateDoc(docRef, {
          audio_files: [...currentFiles, downloadURL],
          preview_audio_url: downloadURL, // Set as latest preview
          last_updated: serverTimestamp()
        });
      }

      return downloadURL;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      throw new Error('Failed to upload audio file');
    }
  },

  // Delete an audio file from Storage and Firestore
  async deleteAudioFile(songId: string, audioUrl: string): Promise<void> {
    try {
      // Delete from Storage
      const storageRef = ref(storage, audioUrl);
      await deleteObject(storageRef);

      // Remove from Firestore
      const docRef = doc(db, SONGS_COLLECTION, songId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentFiles = docSnap.data().audio_files || [];
        const updatedFiles = currentFiles.filter((url: string) => url !== audioUrl);
        
        await updateDoc(docRef, {
          audio_files: updatedFiles,
          last_updated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error deleting audio file:', error);
      throw new Error('Failed to delete audio file');
    }
  },

  // Increment version number
  async incrementVersion(songId: string): Promise<void> {
    try {
      const docRef = doc(db, SONGS_COLLECTION, songId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentVersion = docSnap.data().version_number || 1;
        await updateDoc(docRef, {
          version_number: currentVersion + 1,
          last_updated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing version:', error);
      throw new Error('Failed to increment version');
    }
  },

  // Soft delete (archive) a song
  async archiveSong(songId: string): Promise<void> {
    try {
      const docRef = doc(db, SONGS_COLLECTION, songId);
      await updateDoc(docRef, {
        archived: true,
        last_updated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error archiving song:', error);
      throw new Error('Failed to archive song');
    }
  },

  // Hard delete a song and all its audio files
  async deleteSong(songId: string): Promise<void> {
    try {
      const docRef = doc(db, SONGS_COLLECTION, songId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const audioFiles = docSnap.data().audio_files || [];
        
        // Delete all audio files from Storage
        for (const audioUrl of audioFiles) {
          try {
            const storageRef = ref(storage, audioUrl);
            await deleteObject(storageRef);
          } catch (err) {
            console.warn('Failed to delete audio file:', audioUrl);
          }
        }
      }

      // Delete the Firestore document
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting song:', error);
      throw new Error('Failed to delete song');
    }
  }
};
