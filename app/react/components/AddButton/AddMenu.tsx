import { Type } from "@components/PolyglotModals/SuccessModal";
import { useNfrModal } from "@components/PolyglotModals/useNfrModal";
import { useWorkloadModal } from "@components/PolyglotModals/useWorkloadModal";
import React from "react";
import { useTranslation } from "react-i18next";

interface AddMenuProps {
	onSelect: (type: Type, value: string[]) => void;
	onModalOpenChange?: (open: boolean) => void;
	selectedValue?: any;
	openModalSuccess: (type: Type) => void;
	isEdit: boolean;
}

const AddMenu: React.FC<AddMenuProps> = ({
	onSelect,
	onModalOpenChange,
	selectedValue,
	openModalSuccess,
	isEdit,
}) => {
	const [isOpen, setIsOpen] = React.useState(false);

	const createWorkloadModal = useWorkloadModal(
		setIsOpen,
		selectedValue?.get(Type.workload),
	);
	const createNfrModal = useNfrModal(setIsOpen, selectedValue?.get(Type.nfr));

	React.useEffect(() => {
		onModalOpenChange?.(isOpen);
		return () => onModalOpenChange?.(false);
	}, [isOpen, onModalOpenChange]);

	const { t } = useTranslation(["common"]);

	const hasChanged = (previous: string[] = [], current: string[] = []) => {
		return [...previous].sort().join("|") !== [...current].sort().join("|");
	};

	const handleOpenWorkload = () => {
		createWorkloadModal
			.open()
			.then((result) => {
				const previous = selectedValue?.get(Type.workload) ?? [];
				if (!hasChanged(previous, result)) return;
				openModalSuccess(Type.workload);
				onSelect(Type.workload, result);
			})
			.catch((error) => {
				console.error("Promise rejeitada:", error);
			});
	};

	const handleOpenNfr = () => {
		createNfrModal
			.open()
			.then((result) => {
				const previous = selectedValue?.get(Type.nfr) ?? [];
				if (!hasChanged(previous, result)) return;
				openModalSuccess(Type.nfr);
				onSelect(Type.nfr, result);
			})
			.catch((error) => {
				console.error("Promise rejeitada:", error);
			});
	};

	return (
		<>
			<div className="add-button-menu">
				<button
					onClick={handleOpenWorkload}
					className={`${isEdit ? "edit-button-menu-item" : "add-menu-item"}`}
				>
					{t("Workload")}
				</button>
				<button
					onClick={handleOpenNfr}
					className={`${isEdit ? "edit-button-menu-item" : "add-menu-item"}`}
				>
					{t("Non-functional requirement")}
				</button>
			</div>
		</>
	);
};

export default AddMenu;
