import React, { useState, useEffect, useRef } from "react";
import { Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../supabaseClient.js";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Función para obtener la imagen recortada
const getCroppedImage = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise(resolve => {
        canvas.toBlob(blob => {
            resolve(blob);
        }, 'image/jpeg');
    });
};

export function StudentForm({ isOpen, onClose, onSave, student = null, schedules = [] }) {
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        age: "",
        pathology: "",
        initialWeight: "",
        medicalAssistance: "",
        contact: "",
        emergencyContact: "",
        schedule: "",
        modality: "Grupal",
        photo: null,
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 });
    const imageRef = useRef(null);
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (student) {
            const photoUrl = student.photo_url || null;
            setFormData({
                name: student.name ?? "",
                lastName: student.last_name ?? "",
                age: student.age ?? "",
                pathology: student.pathology ?? "",
                initialWeight: student.initial_weight ?? "",
                medicalAssistance: student.medical_assistance ?? "",
                contact: student.contact ?? "",
                emergencyContact: student.emergency_contact ?? "",
                schedule: student.schedule ?? "",
                modality: student.modality ?? "Grupal",
                photo: photoUrl,
            });
            setPhotoPreview(photoUrl);
        } else {
            setFormData({
                name: "",
                lastName: "",
                age: "",
                pathology: "",
                initialWeight: "",
                medicalAssistance: "",
                contact: "",
                emergencyContact: "",
                schedule: "",
                modality: "Grupal",
                photo: null,
            });
            setPhotoPreview(null);
        }
    }, [student]);

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handlePhotoUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Archivo muy grande", description: "La foto debe ser menor a 5MB", variant: "destructive" });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageToCrop(reader.result);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
    };

    const onImageLoad = (e) => {
        imageRef.current = e.target;
    };

    const handleCrop = async () => {
        if (!imageRef.current || !crop.width || !crop.height) {
            toast({ title: "Error", description: "Por favor, selecciona un área para recortar.", variant: "destructive" });
            return;
        }

        const croppedBlob = await getCroppedImage(imageRef.current, crop);
        const croppedFile = new File([croppedBlob], `cropped-${formData.name || 'photo'}.jpg`, { type: 'image/jpeg' });

        setFormData(prev => ({ ...prev, photo: croppedFile }));
        setPhotoPreview(URL.createObjectURL(croppedFile));
        setShowCropper(false);
    };

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, photo: null }));
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const uploadPhotoToStorage = async (file, studentName, studentLastName) => {
        try {
            const ext = file.name.split(".").pop();
            const fileName = `${studentName.replace(/\s+/g, "_")}_${studentLastName.replace(/\s+/g, "_")}_${Date.now()}.${ext}`;
            const filePath = `avatars/${fileName}`;
            const { error: uploadError } = await supabase.storage.from("students").upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from("students").getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error(error);
            toast({ title: "Error al subir la foto", description: error.message, variant: "destructive" });
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.lastName || !formData.contact) {
            toast({ title: "Campos requeridos", description: "Completa nombre, apellido y contacto", variant: "destructive" });
            return;
        }

        let photoUrl = typeof formData.photo === "string" ? formData.photo : null;
        if (formData.photo instanceof File) {
            photoUrl = await uploadPhotoToStorage(formData.photo, formData.name, formData.lastName);
            if (!photoUrl) return;
        }

        const row = {
            name: formData.name,
            last_name: formData.lastName,
            age: formData.age !== "" ? parseInt(formData.age, 10) : null,
            pathology: formData.pathology || null,
            initial_weight: formData.initialWeight !== "" ? parseFloat(formData.initialWeight) : null,
            medical_assistance: formData.medicalAssistance || null,
            contact: formData.contact,
            emergency_contact: formData.emergencyContact || null,
            schedule: formData.schedule || null,
            modality: formData.modality || null,
            photo_url: photoUrl,
        };

        try {
            let data, error;
            if (student?.id) {
                ({ data, error } = await supabase.from("students").update(row).eq("id", student.id).select().single());
            } else {
                ({ data, error } = await supabase.from("students").insert(row).select().single());
            }
            if (error) throw error;
            toast({ title: student ? "Alumno actualizado" : "Alumno registrado", description: `${formData.name} ${formData.lastName} guardado correctamente` });
            onSave?.(data);
            onClose?.();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.message ?? "No se pudo guardar el alumno", variant: "destructive" });
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="bg-background border-border max-w-2xl max-h-[90vh] overflow-y-auto modal-scroll">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">{student ? "Editar Alumno" : "Registrar Nuevo Alumno"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Foto */}
                        <div className="flex flex-col items-center space-y-3">
                            <div className="relative">
                                {photoPreview ? (
                                    <div className="relative">
                                        <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-border" />
                                        <button type="button" onClick={removePhoto} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors">
                                            <X className="w-3 h-3 text-destructive-foreground" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                                        <Upload className="w-8 h-8 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" /> {photoPreview ? "Cambiar Foto" : "Subir Foto"}
                            </Button>
                            <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" ref={fileInputRef} />
                        </div>

                        {/* Campos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground">Nombre *</Label>
                                <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Nombre del alumno" required />
                            </div>

                            {/* Apellido */}
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-foreground">Apellido *</Label>
                                <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} placeholder="Apellido del alumno" required />
                            </div>

                            {/* Edad */}
                            <div className="space-y-2">
                                <Label htmlFor="age" className="text-foreground">Edad</Label>
                                <Input id="age" type="number" value={formData.age} onChange={(e) => handleInputChange("age", e.target.value)} placeholder="Edad" />
                            </div>

                            {/* Peso Inicial */}
                            <div className="space-y-2">
                                <Label htmlFor="initialWeight" className="text-foreground">Peso Inicial (kg)</Label>
                                <Input id="initialWeight" type="number" step="0.1" value={formData.initialWeight} onChange={(e) => handleInputChange("initialWeight", e.target.value)} placeholder="Peso inicial" />
                            </div>

                            {/* Contacto */}
                            <div className="space-y-2">
                                <Label htmlFor="contact" className="text-foreground">Número de Contacto *</Label>
                                <Input id="contact" value={formData.contact} onChange={(e) => handleInputChange("contact", e.target.value)} placeholder="Teléfono de contacto" required />
                            </div>

                            {/* Contacto de Emergencia */}
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContact" className="text-foreground">Contacto de Emergencia</Label>
                                <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => handleInputChange("emergencyContact", e.target.value)} placeholder="Contacto de tercero" />
                            </div>

                            {/* Modalidad */}
                            <div className="space-y-2">
                                <Label htmlFor="modality" className="text-foreground font-semibold">Modalidad</Label>
                                <Select value={formData.modality} onValueChange={(v) => handleInputChange("modality", v)}>
                                    <SelectTrigger className="w-full border-2 border-primary rounded-lg bg-gray-800 px-3 py-2 text-white">
                                        <SelectValue placeholder="Seleccionar modalidad" className="text-white" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 text-white">
                                        <SelectItem value="Grupal" className="text-white">Grupal</SelectItem>
                                        <SelectItem value="Personalizado" className="text-white">Personalizado</SelectItem>
                                        <SelectItem value="Semi-personalizado" className="text-white">Semi-personalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Horario de Referencia */}
                            <div className="space-y-2">
                                <Label htmlFor="schedule" className="text-foreground">Horario de Referencia</Label>
                                <Select value={formData.schedule} onValueChange={(v) => handleInputChange("schedule", v)}>
                                    <SelectTrigger className="bg-gray-800">
                                        <SelectValue placeholder="Seleccionar horario" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800">
                                        {schedules.map(s => {
                                            const daysStr = (s.days || []).join(", ");
                                            return (
                                                <SelectItem key={s.id} value={`${daysStr} ${s.startTime}-${s.endTime}`}>
                                                    {daysStr} {s.startTime}-{s.endTime}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Patología */}
                            <div className="space-y-2">
                                <Label htmlFor="pathology" className="text-foreground">Patología</Label>
                                <Input id="pathology" value={formData.pathology} onChange={(e) => handleInputChange("pathology", e.target.value)} placeholder="Patologías o condiciones médicas" />
                            </div>

                            {/* Asistencia Médica */}
                            <div className="space-y-2">
                                <Label htmlFor="medicalAssistance" className="text-foreground">Asistencia Médica</Label>
                                <Input id="medicalAssistance" value={formData.medicalAssistance} onChange={(e) => handleInputChange("medicalAssistance", e.target.value)} placeholder="Información sobre asistencia médica" />
                            </div>

                            {/* Botones */}
                            <div className="flex space-x-3 pt-4 col-span-2">
                                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90">
                                    <Save className="w-4 h-4 mr-2" />{student ? "Actualizar" : "Registrar"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal del Cropper */}
            <Dialog open={showCropper} onOpenChange={setShowCropper}>
                <DialogContent className="bg-background border-border max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">Recortar Imagen</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                        {imageToCrop && (
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1}>
                                <img src={imageToCrop} onLoad={onImageLoad} ref={imageRef} />
                            </ReactCrop>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowCropper(false)}>Cancelar</Button>
                        <Button onClick={handleCrop}>
                            <Save className="w-4 h-4 mr-2" /> Recortar y Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
